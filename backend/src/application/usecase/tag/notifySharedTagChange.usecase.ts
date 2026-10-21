import { ITagRepository, IListRepository, IPublisher } from '@/domain';
import { IMemberRepository } from '@/domain/repositories/IMember.repository';

export class NotifySharedTagChangeUsecase {
  constructor(
    private readonly tags: ITagRepository,
    private readonly lists: IListRepository,
    private readonly members: IMemberRepository,
    private readonly publisher: IPublisher,
  ) {}

  async execute<T>(
    input: { userId: string; tagId: string; operation: 'update' | 'delete' },
    mutation: () => Promise<T>,
  ): Promise<T> {
    const userIds = new Set([input.userId]);
    // Resolve recipients before rename/delete removes the old tag references.
    const tag = await this.tags.findOne({ id: input.tagId, user: input.userId });
    if (tag) {
      const lists = await this.lists.getListByTagNameAndUserId({ userId: input.userId, tagName: [tag.name] });
      const memberIds = [...new Set(lists.filter((list) => list.isShareList).flatMap((list) => list.members))];
      if (memberIds.length > 0) {
        const members = await this.members.findManyByIds(memberIds);
        for (const member of members) {
          if (member.user && member.status === 'accept') userIds.add(member.user);
        }
      }
    }
    const result = await mutation();
    try {
      await this.publisher.pub('Tag.exchange', `Tag.${input.operation}.withShare`, 'direct', {
        userIds: [...userIds],
        event: `tag-${input.operation}-with-share`,
        data: { operation: input.operation },
      });
    } catch (error) {
      console.error('[SharedTag] notification failed after mutation', error);
    }
    return result;
  }
}
