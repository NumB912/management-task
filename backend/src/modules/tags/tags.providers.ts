import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { IPublisher } from '@/domain';
import { NotifySharedTagChangeUsecase } from '@/application/usecase/tag/notifySharedTagChange.usecase';
import {
  MemberRepository,
  FilterRepository,
  ListRepository,
  RuleRepository,
  TagRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { AddTagsForMemberUsecase } from '@/application/usecase/tag/addTagsForMember.usecase.js';
import { CreateTagUsecase } from '@/application/usecase/tag/createTag.usecase.js';
import { DeleteTagOnlyMeUsecase } from '@/application/usecase/tag/deleteTagOnlyMe.usecase.js';
import { DeleteTagWithShareUsecase } from '@/application/usecase/tag/deleteTagWithShare.usecase.js';
import { GetAllTagsUsecase } from '@/application/usecase/tag/getAllTag.usecase.js';
import { GetTagByIdUsecase } from '@/application/usecase/tag/getTagById.usecase.js';
import { SyncMemberTagsUseCase } from '@/application/usecase/tag/SynsMemberTag.usecase.js';
import { UpdateTagOnlyMeUsecase } from '@/application/usecase/tag/updateTagOnlyMe.usecase.js';
import { UpdateTagUsecase } from '@/application/usecase/tag/updateTagWithShare.usecase.js';

export const tagsProviders = [
  {
    provide: NotifySharedTagChangeUsecase,
    inject: [TYPES.TagRepository, TYPES.ListRepository, TYPES.MemberRepository, TYPES.Publisher],
    useFactory: (tags: TagRepository, lists: ListRepository, members: MemberRepository, publisher: IPublisher) =>
      new NotifySharedTagChangeUsecase(tags, lists, members, publisher),
  },
  {
    provide: TYPES.AddTagsForMemberUsecase,
    inject: [TYPES.MemberRepository, TYPES.SynsMemberTagUsecase],
    useFactory: (
      memberRepo: MemberRepository,
      syncMemberTagUsecase: SyncMemberTagsUseCase,
    ) => new AddTagsForMemberUsecase(memberRepo, syncMemberTagUsecase),
  },
  {
    provide: TYPES.CreateTagUsecase,
    inject: [TYPES.TagRepository],
    useFactory: (tagRepo: TagRepository) => new CreateTagUsecase(tagRepo),
  },
  {
    provide: TYPES.DeleteTagOnlyMeUsecase,
    inject: [
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.RuleRepository,
      TYPES.UnitWork,
    ],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      ruleRepo: RuleRepository,
      unitWork: UnitWorkMongo,
    ) => new DeleteTagOnlyMeUsecase(tagRepo, listRepo, ruleRepo, unitWork),
  },
  {
    provide: TYPES.DeleteTagWithShareUsecase,
    inject: [
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.RuleRepository,
      TYPES.UnitWork,
    ],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      ruleRepo: RuleRepository,
      unitWork: UnitWorkMongo,
    ) => new DeleteTagWithShareUsecase(tagRepo, listRepo, ruleRepo, unitWork),
  },
  {
    provide: TYPES.GetAllTagUsecase,
    inject: [TYPES.TagRepository],
    useFactory: (tagRepo: TagRepository) => new GetAllTagsUsecase(tagRepo),
  },
  {
    provide: TYPES.GetTagByIdUsecase,
    inject: [TYPES.TagRepository, TYPES.TaskRepository],
    useFactory: (tagRepo: TagRepository, taskRepo: TaskRepository) =>
      new GetTagByIdUsecase(tagRepo, taskRepo),
  },
  {
    provide: TYPES.SynsMemberTagUsecase,
    inject: [TYPES.TagRepository],
    useFactory: (tagRepo: TagRepository) => new SyncMemberTagsUseCase(tagRepo),
  },
  {
    provide: TYPES.UpdateTagOnlyMeUsecase,
    inject: [
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.RuleRepository,
      TYPES.FilterRepository,
      TYPES.UnitWork,
    ],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      ruleRepo: RuleRepository,
      filterRepo: FilterRepository,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateTagOnlyMeUsecase(
        tagRepo,
        listRepo,
        ruleRepo,
        filterRepo,
        unitWork,
      ),
  },
  {
    provide: TYPES.UpdateTagUsecase,
    inject: [
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.RuleRepository,
      TYPES.AddTagsForMemberUsecase,
      TYPES.UnitWork,
    ],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      ruleRepo: RuleRepository,
      addTagsForMemberUsecase: AddTagsForMemberUsecase,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateTagUsecase(
        tagRepo,
        listRepo,
        ruleRepo,
        addTagsForMemberUsecase,
        unitWork,
      ),
  },
];
