import { IUsecase, ITagRepository, IListRepository, AppError, IRuleRepository, IUnitWork } from '@/domain';

export class DeleteTagWithShareUsecase implements IUsecase<boolean> {
  constructor(
    private readonly TagRepository: ITagRepository,
    private readonly ListRepository: IListRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: { id: string; userId: string }): Promise<boolean> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let started = false;
      try {
        await this.unitWork.startTransaction();
        started = true;
        const session = await this.unitWork.getSession();
        const tag = await this.TagRepository.findOne(
          { id: DTO.id, user: DTO.userId }, session,
        );
        if (!tag) throw new AppError('ERROR', 'Không tìm thấy tag', 400);

        const lists = await this.ListRepository.getListByUser({
          userId: DTO.userId, session,
        }) ?? [];

        const listIds = lists.filter((list) => list.shared_tags?.some(
          (name) => name.toLocaleLowerCase() === tag.name.toLocaleLowerCase(),
        )).map((list) => list.id);
        await this.TagRepository.deleteByName({ userId: DTO.userId, name: tag.name }, session);
        if (listIds.length > 0) {
          const ruleData = await this.RuleRepository.getRuleInListAndTags({
            listIds, nameTags: [tag.name], session,
          }) ?? [];
          const ruleIds = ruleData.flatMap((list) => list.rules.map((rule) => rule.id));
          await this.ListRepository.pullTagsOutOfList({
            listIds, nameTags: [tag.name], session,
          });
          await this.RuleRepository.pullTagsOutOfRule({
            nameTags: [tag.name], ruleIds, session,
          });
          await this.TagRepository.deleteSharedTagsInLists({
            name: tag.name, listIds,
          }, session);
        }
        await this.unitWork.commitTransaction();
        return true;
      } catch (error) {
        if (started) {
          try {
            await this.unitWork.rollBackTransaction();
          } catch (rollbackError) {
            console.error('[DeleteTagWithShare] rollback failed', rollbackError);
          }
        }
        const mongoError = error as {
          code?: number;
          hasErrorLabel?: (label: string) => boolean;
          errorLabels?: string[];
        } | null;
        const retryable = mongoError?.code === 112 ||
          mongoError?.hasErrorLabel?.('TransientTransactionError') ||
          mongoError?.errorLabels?.includes('TransientTransactionError');
        if (retryable && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** (attempt - 1)));
          continue;
        }
        if (error instanceof AppError) throw error;
        console.error('[DeleteTagWithShare] transaction failed', error);
        throw new AppError('ERROR', 'Lỗi trong quá trình xóa thẻ chia sẻ', 500);
      }
    }
    throw new AppError('ERROR', 'Lỗi trong quá trình xóa thẻ chia sẻ', 500);
  }
}
