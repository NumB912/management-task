import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  UserRepository,
  ListRepository,
  RuleRepository,
  SectionRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { CreateListUsecase } from '@/application/usecase/lists/createList.usecase.js';
import { DeleteListUsecase } from '@/application/usecase/lists/deleteList.usecase.js';
import { GetInboxUsecase } from '@/application/usecase/lists/getInbox.usecase.js';
import { GetAllListUsecase } from '@/application/usecase/lists/getListAll.usecase.js';
import { GetListByIdUsecase } from '@/application/usecase/lists/getListById.usecase.js';
import { GetAllListSectionUsecase } from '@/application/usecase/lists/getListSection.usecase.js';
import { InitListUsecase } from '@/application/usecase/lists/initList.usecase.js';
import { SortSectionUsecase } from '@/application/usecase/lists/sortSection.usecase.js';
import { UpdateListUsecase } from '@/application/usecase/lists/updateList.usecase.js';
import { RealtimeNotifier } from '@/application/usecase/notifications/notification.usecase.js';
import { IUserRepository } from '@/domain';

export const listsProviders = [
  {
    provide: TYPES.CreateListUsecase,
    inject: [TYPES.InitListUsecase, TYPES.UnitWork],
    useFactory: (initListUsecase: InitListUsecase, unitWork: UnitWorkMongo) =>
      new CreateListUsecase(initListUsecase, unitWork),
  },
  {
    provide: TYPES.DeleteListUsecase,
    inject: [
      TYPES.ListRepository,
      TYPES.SectionRepository,
      TYPES.TaskRepository,
      TYPES.RuleRepository,
      TYPES.MemberRepository,
      TYPES.UserRepository,
      TYPES.RealTimeNotifier,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      listRepo: ListRepository,
      sectionRepo: SectionRepository,
      taskRepo: TaskRepository,
      ruleRepo: RuleRepository,
      memberRepo: MemberRepository,
      userRepo: UserRepository,
      realtimeNotifier: RealtimeNotifier,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new DeleteListUsecase(
        listRepo,
        sectionRepo,
        taskRepo,
        ruleRepo,
        memberRepo,
        userRepo,
        realtimeNotifier,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.GetInboxUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) => new GetInboxUsecase(listRepo),
  },
  {
    provide: TYPES.GetAllListUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) => new GetAllListUsecase(listRepo),
  },
  {
    provide: TYPES.GetListByIdUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) => new GetListByIdUsecase(listRepo),
  },
  {
    provide: TYPES.GetAllListSectionUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) =>
      new GetAllListSectionUsecase(listRepo),
  },
  {
    provide: TYPES.InitListUsecase,
    inject: [
      TYPES.ListRepository,
      TYPES.SectionRepository,
      TYPES.UserRepository,
      TYPES.MemberRepository,
    ],
    useFactory: (
      listRepo: ListRepository,
      sectionRepo: SectionRepository,
      userRepo: IUserRepository,
      memberRepo: MemberRepository,
    ) => new InitListUsecase(listRepo, sectionRepo, userRepo, memberRepo),
  },
  {
    provide: TYPES.SortSectionUsecase,
    inject: [
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) => new SortSectionUsecase(listRepo, memberRepo, publisher, unitWork),
  },
  {
    provide: TYPES.UpdateListUsecase,
    inject: [
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.UserRepository,
      TYPES.RealTimeNotifier,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      userRepo: UserRepository,
      realtimeNotifier: RealtimeNotifier,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateListUsecase(
        listRepo,
        memberRepo,
        userRepo,
        realtimeNotifier,
        publisher,
        unitWork,
      ),
  },
];
