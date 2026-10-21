import { IUsecase, AppError, ITagRepository, IListRepository, IRuleRepository, IUnitWork } from "@/domain";
import { AddTagsForMemberUsecase } from "./index";


export class UpdateTagUsecase implements IUsecase<
  boolean
> {
  constructor(private readonly TagRepository: ITagRepository, private readonly ListRepository: IListRepository, private readonly RuleRepository: IRuleRepository, private readonly addTagsForMember: AddTagsForMemberUsecase, private readonly unitWork: IUnitWork) { }
  async execute(
    updateTagDTO: {
      id: string,
      name?: string,
      color?: string,
      userId: string,
    }
  ): Promise<boolean> {
    const { userId, name, id, color } = updateTagDTO

    const tagCur = await this.TagRepository.findOne({ id: id, user: userId })
    if (!tagCur) {
      throw new AppError("NOT_FOUND", `Không tìm thấy`, 404);
    }

    if (name === undefined && color !== undefined) {
      await this.TagRepository.update(id, { color });
      return true;
    }
    if (name === undefined) {
      throw new AppError("BAD_REQUEST", "Không có thuộc tính cần cập nhật", 400);
    }

    if (name != undefined) {
      const isSameName = await this.TagRepository.findTagByName({ name: name, userId: userId })
      if (isSameName && isSameName.id !== id) {
        throw new AppError("NOT_FOUND", `Trùng tên rồi`, 404);
      }
    }
    try {
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const lists = await this.ListRepository.getListByTagNameAndUserId({
        userId: userId,
        tagName: [tagCur.name],
        session:session
      }) ?? []
      const listIds = lists.map((list) => list.id)
      const rulesOfLists = await this.RuleRepository.getRuleInListAndTags({
        listIds: listIds,
        nameTags: [tagCur.name],
        session:session
      }) ?? []
      const ruleIds = rulesOfLists.flatMap((rule) => rule.rules.map((rule) => rule.id))
      await this.ListRepository.updateListShareTag({
        currentName: tagCur.name,
        newName: name,
        listIds,
        session,
      });
      await this.RuleRepository.updateRuleTag({
        currentName: tagCur.name,
        newName: name,
        ruleIds,
        session,
      });
      await this.TagRepository.update(id, {
        name,
        ...(color !== undefined ? { color } : {}),
      }, session);

      await this.addTagsForMember.execute({
        newTags: [name],
        listIds,
      }, session);

      await this.unitWork.commitTransaction()
      return true
    } catch (error) {

      await this.unitWork.rollBackTransaction()
      console.error(error);
      throw new AppError(
        "ERROR_UPDATE",
        `Lỗi trong quá trình thực thi tag:${error}`,
        500,
      );
    }
  }
}
