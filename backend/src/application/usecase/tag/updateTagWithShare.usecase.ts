import { IUsecase, AppError, ITagRepository, IListRepository, IRuleRepository, IUnitWork } from "@/domain";
import { AddTagsForMemberUsecase } from "./index";


export class UpdateTagUsecase implements IUsecase<
  boolean
> {
  constructor(private readonly TagRepository: ITagRepository, private readonly ListRepository: IListRepository, private readonly RuleRepository: IRuleRepository, private readonly addTagsForMember: AddTagsForMemberUsecase, private readonly unitWork: IUnitWork) { }
  async execute(
    updateTagDTO: {
      id: string,
      name: string,
      userId: string,
    }
  ): Promise<boolean> {
    const { userId, name, id } = updateTagDTO

    const tagCur = await this.TagRepository.findOne({ id: id, user: userId })
    if (!tagCur) {
      throw new AppError("NOT_FOUND", `KhÃ´ng tÃ¬m tháº¥y`, 404);
    }

    if (name != undefined) {
      const isSameName = await this.TagRepository.findTagByName({ name: name, userId: userId })
      if (isSameName) {
        throw new AppError("NOT_FOUND", `trÃ¹ng tÃªn rá»“i`, 404);
      }
    }
    try {
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const lists = await this.ListRepository.getListByTagNameAndUserId({
        userId: userId,
        tagName: [tagCur.name],
      }) ?? []
      const listIds = lists.map((list) => list.id)
      const rulesOfLists = await this.RuleRepository.getRuleInListAndTags({
        listIds: listIds,
        nameTags: [tagCur.name]
      }) ?? []
      const ruleIds = rulesOfLists.flatMap((rule) => rule.rules.map((rule) => rule.id))
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

      await this.TagRepository.updateByName({
        name: tagCur.name,
        userId: userId,
        data: {
          name: name
        }
      },session)

      await this.addTagsForMember.execute({
        newTags: [tagCur.name],
        listIds: listIds,
      },session)

      await this.unitWork.commitTransaction()
      return true
    } catch (error) {

      await this.unitWork.rollBackTransaction()
      console.error(error);
      throw new AppError(
        "ERROR_UPDATE",
        `Lá»—i trong quÃ¡ trÃ¬nh cáº­p nháº­t tag:${error}`,
        500,
      );
    }
  }
}
