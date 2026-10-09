import {
  IUsecase,
  ITagRepository,
  IListRepository,
  AppError,
  IRuleRepository,
  IUnitWork,
} from '@/domain';

export class DeleteTagOnlyMeUsecase implements IUsecase<boolean> {
  constructor(
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(DTO: {
    id: string;
    userId: string;
    isShare?: boolean;
  }): Promise<boolean> {
    const { id, userId } = DTO;
    const tag = await this.TagRepository.findOne({
      id: id,
      user: userId,
    });
    if (!tag) {
      throw new AppError('ERRORR', 'Không tìm thấy thẻ', 400);
    }
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      const listByUser =
        (await this.ListRepository.getListByUser({ userId })) ?? [];
      const shareListTag = listByUser.filter((list) =>
        list.shared_tags?.some(
          (shareTag) =>
            shareTag.toLocaleLowerCase() == tag.name.toLocaleLowerCase(),
        ),
      );
      const listIds = shareListTag
        .filter((list) => !list.isShareList)
        .map((list) => list.id);
      const ruleData =
        (await this.RuleRepository.getRuleInListAndTags({
          listIds,
          nameTags: [tag.name],
        })) ?? [];
      const ruleIds = ruleData.flatMap((rule) => rule.rules.map((r) => r.id));
      await this.ListRepository.pullTagsOutOfList({
        listIds,
        nameTags: [tag.name],
        session,
      });

      await this.RuleRepository.pullTagsOutOfRule({
        nameTags: [tag.name],
        ruleIds,
        session,
      });
      const checkList = shareListTag.some((list) => list.isShareList);
      if (!checkList) {
        await this.TagRepository.deleteByName(
          {
            name: tag.name,
            userId: userId,
          },
          session,
        );
      } else {
        await this.TagRepository.updateByName(
          {
            name: tag.name,
            userId: userId,
            data: {
              isShareTag: true,
            },
          },
          session,
        );
      }
      await this.unitWork.commitTransaction();
      return true;
    } catch (error) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError('ERROR', 'Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi', 500);
    }
  }
}
