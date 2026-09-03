import { IUsecase, ITagRepository, IListRepository, AppError, IRuleRepository, IUnitWork } from "@/app/core/domain";
export class DeleteTagWithShareUsecase implements IUsecase<boolean> {
  constructor(private readonly TagRepository: ITagRepository, private readonly ListRepository: IListRepository, private readonly RuleRepository: IRuleRepository, private readonly unitWork: IUnitWork) { }
  async execute(DTO: {
    id: string, userId: string
  }): Promise<boolean> {
    const { id, userId } = DTO
    const tag = await this.TagRepository.findOne({
      id: id,
      user: userId
    })
    if (!tag) {
      throw new AppError("ERROR", "Không có dữ liệu", 400)
    }
    try {
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const listByUser = await this.ListRepository.getListByUser({
        userId: userId
      }) ?? []

      const listIds = listByUser.filter((list) => list.shared_tags?.some((shareTag) => {
        return shareTag.tag.toLocaleLowerCase() == tag.name.toLocaleLowerCase()
      })).map((list) => list.id)
        
      await this.TagRepository.deleteBy({
        user:userId,
        name: tag.name,
      },session)

      if(listIds.length==0){
        return true
      }

      const ruleData = await this.RuleRepository.getRuleInListAndTags({
        listIds: listIds,
        nameTags: [tag.name]
      }) ?? []

      const ruleIds = ruleData.flatMap((rule) => rule.rules.map((rule) => rule.id))
      await this.ListRepository.pullTagsOutOfList({
        listIds: listIds,
        nameTags: [ tag.name],
        session: session
      })
      await this.RuleRepository.pullTagsOutOfRule({
          nameTags: [ tag.name],
          ruleIds: ruleIds,
          session: session
        })

      await this.unitWork.commitTransaction()
      return true
    } catch (error) {
      console.error(error)
      await this.unitWork.rollBackTransaction()
      throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
    }
  }
}
