import { IUsecase, AppError, ITagRepository, IListRepository, IRuleRepository, IUnitWork } from "@/app/core/domain";

export class UpdateTagOnlyMeUsecase implements IUsecase<
  boolean
> {
  constructor(private readonly TagRepository: ITagRepository, private readonly ListRepository: IListRepository, private readonly RuleRepository: IRuleRepository, private readonly unitWork: IUnitWork) { }
  async execute(
    updateTagDTO: {
      id: string,
      name: string,
      userId: string,
    }
  ): Promise<boolean> {
    const { userId, name, id } = updateTagDTO
    const tagCur = await this.TagRepository.findOne({ id:id, user: userId })
    if (!tagCur) {
      throw new AppError("NOT_FOUND", `Không tìm thấy`, 404);
    }
    console.log(name)
    if (name != undefined) {
      const isSameName = await this.TagRepository.findTagByName({ name: name, userId: userId })
      if (isSameName) {
        throw new AppError("CONFLICT", `trùng tên rồi`, 404);
      }
    }

    try {
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const lists = await this.ListRepository.getListByTagNameAndUserId({
        userId: userId,
        tagName: [tagCur.name],
      }) ?? []
      const listWithouShare = lists.filter((list) => !list.isShareList)
      const listIds = listWithouShare.map((list) => list.id)
      const rulesOfLists = await this.RuleRepository.getRuleInListAndTags({
        listIds: listIds,
        nameTags: [tagCur.name]
      }) ?? []
      const ruleIds = rulesOfLists.flatMap((rule) => rule.rules.map((rule) => rule.id))
      const isShareForAnyList = lists.some((list) => list.isShareList)
      await this.TagRepository.updateByName({
        name: tagCur.name,
        userId: userId,
        session: session,
        data: {
          name: name
        },
      })
      if (isShareForAnyList) {
        await this.TagRepository.create({
          name: tagCur.name,
          isShareTag: true,
          user: userId,
        }, session)
      }

      await Promise.all([this.ListRepository.updateListShareTag({
        currentName: tagCur.name,
        newName: name,
        listIds: listIds,
        session
      })
        , this.RuleRepository.updateRuleTag({
          currentName: tagCur.name,
          newName: name,
          ruleIds: ruleIds,
          session
        })
      ])
      await this.unitWork.commitTransaction()
      return true
    } catch (error) {
      await this.unitWork.rollBackTransaction()
      console.error(error);
      throw new AppError(
        "ERROR_UPDATE",
        `Lỗi trong quá trình cập nhật tag:${error}`,
        500,
      );
    }
  }
}
