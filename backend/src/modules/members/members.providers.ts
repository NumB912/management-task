import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  UserRepository,
  ListRepository,
} from '@/infrastructure/repositories/index.js';
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { ChangeRoleUsecase } from '@/application/usecase/members/changeRole.usecase.js';
import { DeleteMemberUsecase } from '@/application/usecase/members/deleteMember.usecase.js';
import { ExitMemberUsecase } from '@/application/usecase/members/exit.usecase.js';
import { InviteMemberUsecase } from '@/application/usecase/members/inviteMember.usecase.js';
import { SearchMemberUsecase } from '@/application/usecase/members/searchMember.usecase.js';
import { StatusInviteUsecase } from '@/application/usecase/members/statusInvite.usecase.js';
import { RealtimeNotifier } from '@/application/usecase/notifications/notification.usecase.js';
import { SyncMemberTagsUseCase } from '@/application/usecase/tag/SynsMemberTag.usecase.js';

export const membersProviders = [
  {
    provide: TYPES.ChangeRoleUsecase,
    inject: [
      TYPES.MemberRepository,
      TYPES.ListRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      memberRepo: MemberRepository,
      listRepo: ListRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) => new ChangeRoleUsecase(memberRepo, listRepo, publisher, unitWork),
  },
  {
    provide: TYPES.DeleteMemberUsecase,
    inject: [
      TYPES.MemberRepository,
      TYPES.ListRepository,
      TYPES.UserRepository,
      TYPES.Publisher,
      TYPES.RealTimeNotifier,
      TYPES.UnitWork,
    ],
    useFactory: (
      memberRepo: MemberRepository,
      listRepo: ListRepository,
      userRepo: UserRepository,
      publisher: Publisher,
      realtimeNotifier: RealtimeNotifier,
      unitWork: UnitWorkMongo,
    ) =>
      new DeleteMemberUsecase(
        memberRepo,
        listRepo,
        userRepo,
        publisher,
        realtimeNotifier,
        unitWork,
      ),
  },
  {
    provide: TYPES.exitFromList,
    inject: [
      TYPES.MemberRepository,
      TYPES.ListRepository,
      TYPES.UserRepository,
      TYPES.Publisher,
      TYPES.RealTimeNotifier,
      TYPES.UnitWork,
    ],
    useFactory: (
      memberRepo: MemberRepository,
      listRepo: ListRepository,
      userRepo: UserRepository,
      publisher: Publisher,
      realtimeNotifier: RealtimeNotifier,
      unitWork: UnitWorkMongo,
    ) =>
      new ExitMemberUsecase(
        memberRepo,
        listRepo,
        userRepo,
        publisher,
        realtimeNotifier,
        unitWork,
      ),
  },
  {
    provide: TYPES.InviteMemberUsecase,
    inject: [
      TYPES.MemberRepository,
      TYPES.UserRepository,
      TYPES.ListRepository,
      TYPES.RealTimeNotifier,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      memberRepo: MemberRepository,
      userRepo: UserRepository,
      listRepo: ListRepository,
      realtimeNotifier: RealtimeNotifier,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new InviteMemberUsecase(
        memberRepo,
        userRepo,
        listRepo,
        realtimeNotifier,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.SearchMemberUsecase,
    inject: [TYPES.MemberRepository, TYPES.UserRepository],
    useFactory: (memberRepo: MemberRepository, userRepo: UserRepository) =>
      new SearchMemberUsecase(memberRepo, userRepo),
  },
  {
    provide: TYPES.StatusInviteUsecase,
    inject: [
      TYPES.MemberRepository,
      TYPES.ListRepository,
      TYPES.notificationRepository,
      TYPES.SynsMemberTagUsecase,
      TYPES.UserRepository,
      TYPES.Publisher,
      TYPES.RealTimeNotifier,
      TYPES.UnitWork,
    ],
    useFactory: (
      memberRepo: MemberRepository,
      listRepo: ListRepository,
      notificationRepo: NotificationRepository,
      syncMemberTagUsecase: SyncMemberTagsUseCase,
      userRepo: UserRepository,
      publisher: Publisher,
      realtimeNotifier: RealtimeNotifier,
      unitWork: UnitWorkMongo,
    ) =>
      new StatusInviteUsecase(
        memberRepo,
        listRepo,
        notificationRepo,
        syncMemberTagUsecase,
        userRepo,
        publisher,
        realtimeNotifier,
        unitWork,
      ),
  },
];
