import { IUsecase, ITagRepository, IListRepository, AppError, IRuleRepository, IUnitWork } from "@/app/core/domain";


export class DeleteTagOnlyMeUsecase implements IUsecase<boolean> {
  constructor(private readonly TagRepository: ITagRepository, private readonly ListRepository: IListRepository, private readonly RuleRepository: IRuleRepository, private readonly unitWork: IUnitWork) { }
  async execute(DTO: {
    id: string, userId: string, isShare?: boolean
  }): Promise<boolean> {
    const { id, userId } = DTO
    const tag = await this.TagRepository.findOne({
      id: id,
      user: userId
    })
    if (!tag) {
      throw new AppError("ERRORR", "Không có dữ liệu", 400)
    }
    try {
      const listByUser = await this.ListRepository.getListByUser({ userId }) ?? []
      const shareListTag = listByUser
        .filter((list) =>
          list.shared_tags?.some((shareTag) => shareTag.tag.toLocaleLowerCase() == tag.name.toLocaleLowerCase())
        )
      const listIds = shareListTag.filter((list)=>!list.isShareList)
        .map((list) => list.id)
      const ruleData = await this.RuleRepository.getRuleInListAndTags({
        listIds,
        nameTags: [tag.name]
      }) ?? []

      await this.unitWork.startTransaction()
      const session = this.unitWork.getSession()
      const ruleIds = ruleData.flatMap((rule) => rule.rules.map((r) => r.id))
      await this.ListRepository.pullTagsOutOfList({
        listIds,
        nameTags: [tag.name],
        session
      })

      await this.RuleRepository.pullTagsOutOfRule({
        nameTags: [tag.name],
        ruleIds,
        session
      })
      const checkList = shareListTag.some((list) => list.isShareList)
      if (!checkList) {
        await this.TagRepository.deleteByName({
          name: tag.name,
          userId: userId
        })
      } else {
        await this.TagRepository.updateByName({
          name: tag.name,
          userId: userId,
          data: {
            isShareTag: true
          }
        })
      }
      await this.unitWork.commitTransaction()
      return true
    } catch (error) {
      console.error(error)
      await this.unitWork.rollBackTransaction()
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500)
    }
  }
}
