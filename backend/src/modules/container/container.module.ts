import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  UserRepository,
  FilterRepository,
  ListRepository,
  pomodoroRepository,
  RuleRepository,
  SectionRepository,
  TagRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository.js';
import { RedisCache } from '@/infrastructure/cache/redis.cache.js';
import { MongodbClient } from '@/infrastructure/repositories/database/mongoClient.Database.js';
import { DatabaseModels } from '@/infrastructure/repositories/database/clientSchema.database.js';
import {
  FilterMapper,
  ListMapper,
  MemberMapper,
  NotificationMapper,
  pomodoroMapper,
  RuleMapper,
  SectionMapper,
  TagMapper,
  TaskMapper,
  UserMapper,
} from '@infrastructure/mapper';
import CredentialsService from '@/infrastructure/services/ICreadentials.service';
import { GenerateIdService } from '@/infrastructure/services/generateId.service';
import TokenService from '@/infrastructure/services/token.service';
import OTPService from '@/infrastructure/services/otp.service';
import { QueryFilterParser } from '@/infrastructure/services/queryFiltereParser.service';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { CaculateDeadLine } from '@/application/service/CaculateDeadLineDay.service';
import { ChangePasswordUsecase } from '@/application/usecase/auth/changePassword.usecase.js';
import { ConfirmOtpUsecase } from '@/application/usecase/auth/confirm_otp.usecase.js';
import { LoginWithEmailUseCase } from '@/application/usecase/auth/login.usecase.js';
import { LogoutUseCase } from '@/application/usecase/auth/logout.usecase.js';
import { RefreshTokenUseCase } from '@/application/usecase/auth/refreshToken.js';
import { RegisterEmailUsecase } from '@/application/usecase/auth/register.usecase.js';
import { SendChangePasswordUsecase } from '@/application/usecase/auth/sendChangePassword.usecase.js';
import { SendOtpUsecase } from '@/application/usecase/auth/sendOtp.usecase.js';
import { CreateFilterUsecase } from '@/application/usecase/filters/createFilter.usecase.js';
import { DeleteFilterUsecase } from '@/application/usecase/filters/deleteFilter.usecase.js';
import { GetFilterByIdUsecase } from '@/application/usecase/filters/getFilterById.usecase.js';
import { GetAllFiltersUsecase } from '@/application/usecase/filters/getFiltersAll.usecase.js';
import { UpdateFilterUsecase } from '@/application/usecase/filters/updateFilter.usecase.js';
import { CreateListUsecase } from '@/application/usecase/lists/createList.usecase.js';
import { DeleteListUsecase } from '@/application/usecase/lists/deleteList.usecase.js';
import { GetInboxUsecase } from '@/application/usecase/lists/getInbox.usecase.js';
import { GetAllListUsecase } from '@/application/usecase/lists/getListAll.usecase.js';
import { GetListByIdUsecase } from '@/application/usecase/lists/getListById.usecase.js';
import { GetAllListSectionUsecase } from '@/application/usecase/lists/getListSection.usecase.js';
import { InitListUsecase } from '@/application/usecase/lists/initList.usecase.js';
import { SortSectionUsecase } from '@/application/usecase/lists/sortSection.usecase.js';
import { UpdateListUsecase } from '@/application/usecase/lists/updateList.usecase.js';
import { ChangeRoleUsecase } from '@/application/usecase/members/changeRole.usecase.js';
import { CheckPermissionListUsecase } from '@/application/usecase/members/checkPermissionList.usecase.js';
import { CheckPermissionSectionUsecase } from '@/application/usecase/members/checkPermissionSection.usecase.js';
import { CheckPermissionTaskUsecase } from '@/application/usecase/members/checkPremissionTask.usecase.js';
import { DeleteMemberUsecase } from '@/application/usecase/members/deleteMember.usecase.js';
import { ExitMemberUsecase } from '@/application/usecase/members/exit.usecase.js';
import { InviteMemberUsecase } from '@/application/usecase/members/inviteMember.usecase.js';
import { SearchMemberUsecase } from '@/application/usecase/members/searchMember.usecase.js';
import { StatusInviteUsecase } from '@/application/usecase/members/statusInvite.usecase.js';
import { CheckOwnerUsecase } from '@/application/usecase/middleware/checkOwnerList.usecase.js';
import { CheckOwnerTagUsecase } from '@/application/usecase/middleware/checkOwnerTag.usecase.js';
import { GetNotificationsUsecase } from '@/application/usecase/notifications/getNotification.usecase.js';
import { ReadedNotificationUsecase } from '@/application/usecase/notifications/readNotification.usecase.js';
import { RealtimeNotifier } from '@/application/usecase/notifications/notification.usecase.js';
import { CreateRuleUsecase } from '@/application/usecase/rule/createRule.usecase.js';
import { CreateSectionUsecase } from '@/application/usecase/sections/createSection.usecase.js';
import { DeleteSectionUsecase } from '@/application/usecase/sections/deleteSection.usecase.js';
import { GetAllSectionUsecase } from '@/application/usecase/sections/getSectionAll.usecase.js';
import { GetSectionByIdUsecase } from '@/application/usecase/sections/getSectionById.usecase.js';
import { UpdateSectionUsecase } from '@/application/usecase/sections/updateSection.usecase.js';
import { AddTagsForMemberUsecase } from '@/application/usecase/tag/addTagsForMember.usecase.js';
import { CreateTagUsecase } from '@/application/usecase/tag/createTag.usecase.js';
import { DeleteTagOnlyMeUsecase } from '@/application/usecase/tag/deleteTagOnlyMe.usecase.js';
import { DeleteTagWithShareUsecase } from '@/application/usecase/tag/deleteTagWithShare.usecase.js';
import { GetAllTagsUsecase } from '@/application/usecase/tag/getAllTag.usecase.js';
import { GetTagByIdUsecase } from '@/application/usecase/tag/getTagById.usecase.js';
import { SyncMemberTagsUseCase } from '@/application/usecase/tag/SynsMemberTag.usecase.js';
import { UpdateTagOnlyMeUsecase } from '@/application/usecase/tag/updateTagOnlyMe.usecase.js';
import { UpdateTagUsecase } from '@/application/usecase/tag/updateTagWithShare.usecase.js';
import { CreateTaskUsecase } from '@/application/usecase/tasks/createTask.usecase.js';
import { CreateTaskWithSection } from '@/application/usecase/tasks/createTaskWithSection.usecase.js';
import { DeleteTaskUsecase } from '@/application/usecase/tasks/deleteTask.usecase.js';
import { GetAllTasksUsecase } from '@/application/usecase/tasks/findAllTask.usecase.js';
import { GetTaskByIdUsecase } from '@/application/usecase/tasks/findByTaskId.usecase.js';
import { MoveToSectionUsecase } from '@/application/usecase/tasks/moveToSection.usecase.js';
import { GetTodayUsecase } from '@/application/usecase/tasks/today.usecase.js';
import { GetUpcomingUsecase } from '@/application/usecase/tasks/upComming.usecase.js';
import { UpdateRuleUsecase } from '@/application/usecase/tasks/updateRule.usecase.js';
import { UpdateStatusUsecase } from '@/application/usecase/tasks/updateStatusTask.usecase.js';
import { UpdateTaskUsecase } from '@/application/usecase/tasks/updateTask.usecase.js';
import { GetProfileUsecase } from '@/application/usecase/user/getProfile.usecase.js';
import { PutProfileUsecase } from '@/application/usecase/user/profileupdate.usecase.js';
import { WorkSpaceUsecase } from '@/application/usecase/workSpace/workspace.usecase.js';
import { PutAvatarUsecase } from '@/application/usecase/user/avatarPut.usecase';
import { IUserRepository } from '@/domain';
import { DeleteAvatarUsecase } from '@/application/usecase/user/avatarDel.usecase';
import { CreatePomodoroUsecase, DeletePomodoroUsecase, GetPomodoroUsecase, UpdatePomodoroUsecase } from '@/application/usecase/pomodoro';


const repositories = [
  { provide: TYPES.TagRepository, useClass: TagRepository },
  { provide: TYPES.MemberRepository, useClass: MemberRepository },
  { provide: TYPES.UserRepository, useClass: UserRepository },
  { provide: TYPES.RuleRepository, useClass: RuleRepository },
  { provide: TYPES.TaskRepository, useClass: TaskRepository },
  { provide: TYPES.FilterRepository, useClass: FilterRepository },
  { provide: TYPES.pomodoroRepository, useClass: pomodoroRepository },
  { provide: TYPES.SectionRepository, useClass: SectionRepository },
  { provide: TYPES.notificationRepository, useClass: NotificationRepository },
  { provide: TYPES.ListRepository, useClass: ListRepository },
];

const mappers = [
  { provide: TYPES.TagMapper, useClass: TagMapper },
  { provide: TYPES.MemberMapper, useClass: MemberMapper },
  { provide: TYPES.UserMapper, useClass: UserMapper },
  { provide: TYPES.RuleMapper, useClass: RuleMapper },
  { provide: TYPES.TaskMapper, useClass: TaskMapper },
  { provide: TYPES.FilterMapper, useClass: FilterMapper },
  { provide: TYPES.pomodoroMapper, useClass: pomodoroMapper },
  { provide: TYPES.SectionMapper, useClass: SectionMapper },
  { provide: TYPES.NotificationMapper, useClass: NotificationMapper },
  { provide: TYPES.ListMapper, useClass: ListMapper },
];

const services = [
  { provide: TYPES.CredentialsService, useClass: CredentialsService },
  { provide: TYPES.generateId, useClass: GenerateIdService },
  { provide: TYPES.TokenService, useClass: TokenService },
  { provide: TYPES.OtpService, useClass: OTPService },
  { provide: TYPES.QueryFilterParserService, useClass: QueryFilterParser },
  { provide: TYPES.calculateDeadLineService, useClass: CaculateDeadLine },
  { provide: TYPES.UnitWork, useClass: UnitWorkMongo },
  {
    provide: TYPES.Publisher,
    useFactory: async () => await Publisher.create(),
  },
];

const usecase = [
  {
    provide: TYPES.ChangePasswordUsecase,
    inject: [
      TYPES.UserRepository,
      TYPES.TokenService,
      TYPES.CredentialsService,
      TYPES.Cache,
    ],
    useFactory: (
      userRepo: UserRepository,
      tokenService: TokenService,
      credentialsService: CredentialsService,
      cache: RedisCache,
    ) =>
      new ChangePasswordUsecase(
        userRepo,
        tokenService,
        credentialsService,
        cache,
      ),
  },
  {
    provide: TYPES.ConfirmOtpUsecase,
    inject: [TYPES.OtpService, TYPES.TokenService, TYPES.Cache],
    useFactory: (
      otpService: OTPService,
      tokenService: TokenService,
      cache: RedisCache,
    ) => new ConfirmOtpUsecase(otpService, tokenService, cache),
  },
  {
    provide: TYPES.LoginWithEmailUseCase,
    inject: [
      TYPES.UserRepository,
      TYPES.CredentialsService,
      TYPES.TokenService,
      TYPES.Cache,
    ],
    useFactory: (
      userRepo: UserRepository,
      credentialsService: CredentialsService,
      tokenService: TokenService,
      cache: RedisCache,
    ) =>
      new LoginWithEmailUseCase(
        userRepo,
        credentialsService,
        tokenService,
        cache,
      ),
  },
  {
    provide: TYPES.logoutUsecase,
    inject: [TYPES.TokenService, TYPES.Cache],
    useFactory: (tokenService: TokenService, cache: RedisCache) =>
      new LogoutUseCase(tokenService, cache),
  },
  {
    provide: TYPES.RefreshUsecase,
    inject: [TYPES.Cache, TYPES.TokenService, TYPES.UserRepository],
    useFactory: (
      cache: RedisCache,
      tokenService: TokenService,
      userRepo: UserRepository,
    ) => new RefreshTokenUseCase(cache, tokenService, userRepo),
  },
  {
    provide: TYPES.RegisterEmailUsecase,
    inject: [
      TYPES.UserRepository,
      TYPES.InitListUsecase,
      TYPES.CredentialsService,
      TYPES.UnitWork,
    ],
    useFactory: (
      userRepo: UserRepository,
      initListUsecase: InitListUsecase,
      credentialsService: CredentialsService,
      unitWork: UnitWorkMongo,
    ) =>
      new RegisterEmailUsecase(
        userRepo,
        initListUsecase,
        credentialsService,
        unitWork,
      ),
  },
  
  {
    provide: TYPES.SendResetPasswordUsecase,
    inject: [
      TYPES.Publisher,
      TYPES.TokenService,
      TYPES.Cache,
      TYPES.UserRepository,
    ],
    useFactory: (
      publisher: Publisher,
      tokenService: TokenService,
      cache: RedisCache,
      userRepo: UserRepository,
    ) =>
      new SendChangePasswordUsecase(publisher, tokenService, cache, userRepo),
  },
  {
    provide: TYPES.SendOtpUsecase,
    inject: [TYPES.Publisher, TYPES.OtpService, TYPES.UserRepository],
    useFactory: (
      publisher: Publisher,
      otpService: OTPService,
      userRepo: UserRepository,
    ) => new SendOtpUsecase(publisher, otpService, userRepo),
  },
  {
    provide: TYPES.CreateFilterUsecase,
    inject: [
      TYPES.FilterRepository,
      TYPES.TagRepository,
      TYPES.QueryFilterParserService,
    ],
    useFactory: (
      filterRepo: FilterRepository,
      tagRepo: TagRepository,
      queryFilterParser: QueryFilterParser,
    ) => new CreateFilterUsecase(filterRepo, tagRepo, queryFilterParser),
  },
  {
    provide: TYPES.DeleteFilterUsecase,
    inject: [TYPES.FilterRepository],
    useFactory: (filterRepo: FilterRepository) =>
      new DeleteFilterUsecase(filterRepo),
  },
  {
    provide: TYPES.GetFilterByIdUsecase,
    inject: [TYPES.FilterRepository, TYPES.TaskRepository],
    useFactory: (filterRepo: FilterRepository, taskRepo: TaskRepository) =>
      new GetFilterByIdUsecase(filterRepo, taskRepo),
  },
  {
    provide: TYPES.GetAllFilterUsecase,
    inject: [TYPES.FilterRepository],
    useFactory: (filterRepo: FilterRepository) =>
      new GetAllFiltersUsecase(filterRepo),
  },
  {
    provide: TYPES.UpdateFilterUsecase,
    inject: [TYPES.FilterRepository],
    useFactory: (filterRepo: FilterRepository) =>
      new UpdateFilterUsecase(filterRepo),
  },
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
      userRepo:IUserRepository,
      memberRepo: MemberRepository,
    ) => new InitListUsecase(listRepo,sectionRepo,userRepo,memberRepo),
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
    provide: TYPES.CheckPermissionListUsecase,
    inject: [TYPES.MemberRepository, TYPES.ListRepository],
    useFactory: (memberRepo: MemberRepository, listRepo: ListRepository) =>
      new CheckPermissionListUsecase(memberRepo, listRepo),
  },
  {
    provide: TYPES.CheckPermissionSectionUsecase,
    inject: [TYPES.SectionRepository, TYPES.CheckPermissionListUsecase],
    useFactory: (
      sectionRepo: SectionRepository,
      checkPermissionListUsecase: CheckPermissionListUsecase,
    ) =>
      new CheckPermissionSectionUsecase(
        sectionRepo,
        checkPermissionListUsecase,
      ),
  },
  {
    provide: TYPES.CheckPermissionTaskUsecase,
    inject: [TYPES.TaskRepository, TYPES.CheckPermissionListUsecase],
    useFactory: (
      taskRepo: TaskRepository,
      checkPermissionListUsecase: CheckPermissionListUsecase,
    ) => new CheckPermissionTaskUsecase(taskRepo, checkPermissionListUsecase),
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
  {
    provide: TYPES.CheckOwnerUsecase,
    inject: [TYPES.ListRepository],
    useFactory: (listRepo: ListRepository) => new CheckOwnerUsecase(listRepo),
  },
  {
    provide: TYPES.CheckOwnerTagUsecase,
    inject: [TYPES.TagRepository],
    useFactory: (tagRepo: TagRepository) => new CheckOwnerTagUsecase(tagRepo),
  },
  {
    provide: TYPES.getNotification,
    inject: [TYPES.notificationRepository],
    useFactory: (notificationRepo: NotificationRepository) =>
      new GetNotificationsUsecase(notificationRepo),
  },
  {
    provide: TYPES.readNotification,
    inject: [TYPES.notificationRepository],
    useFactory: (notificationRepo: NotificationRepository) =>
      new ReadedNotificationUsecase(notificationRepo),
  },
  {
    provide: TYPES.RealTimeNotifier,
    inject: [TYPES.Publisher, TYPES.notificationRepository],
    useFactory: (
      publisher: Publisher,
      notificationRepo: NotificationRepository,
    ) => new RealtimeNotifier(publisher, notificationRepo),
  },
  {
    provide: TYPES.createpomodoroUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo: pomodoroRepository, unitWork: UnitWorkMongo) =>
      new CreatePomodoroUsecase(pomodoroRepo, unitWork),
  },
  {
    provide: TYPES.DeletePomodoroUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo:pomodoroRepository, unitWork:UnitWorkMongo) =>
      new DeletePomodoroUsecase(pomodoroRepo, unitWork),
  },
    {
    provide: TYPES.updatePomodoUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo:pomodoroRepository, unitWork:UnitWorkMongo) =>
      new UpdatePomodoroUsecase(pomodoroRepo, unitWork),
  },
  {
    provide: TYPES.GetPomodoroUsecase,
    inject: [TYPES.pomodoroRepository],
    useFactory: (pomodoroRepo: pomodoroRepository) =>
      new GetPomodoroUsecase(pomodoroRepo),
  },
  {
    provide: TYPES.CreateRuleUsecase,
    inject: [TYPES.RuleRepository],
    useFactory: (ruleRepo: RuleRepository) => new CreateRuleUsecase(ruleRepo),
  },
  {
    provide: TYPES.CreateSectionUsecase,
    inject: [
      TYPES.SectionRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      sectionRepo: SectionRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new CreateSectionUsecase(
        sectionRepo,
        listRepo,
        memberRepo,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.DeleteSectionUsecase,
    inject: [
      TYPES.SectionRepository,
      TYPES.TaskRepository,
      TYPES.RuleRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      sectionRepo: SectionRepository,
      taskRepo: TaskRepository,
      ruleRepo: RuleRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new DeleteSectionUsecase(
        sectionRepo,
        taskRepo,
        ruleRepo,
        listRepo,
        memberRepo,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.GetAllSectionUsecase,
    inject: [TYPES.SectionRepository],
    useFactory: (sectionRepo: SectionRepository) =>
      new GetAllSectionUsecase(sectionRepo),
  },
  {
    provide: TYPES.GetSectionByIdUsecase,
    inject: [TYPES.SectionRepository],
    useFactory: (sectionRepo: SectionRepository) =>
      new GetSectionByIdUsecase(sectionRepo),
  },
  {
    provide: TYPES.UpdateSectionUsecase,
    inject: [
      TYPES.SectionRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      sectionRepo: SectionRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateSectionUsecase(
        sectionRepo,
        listRepo,
        memberRepo,
        publisher,
        unitWork,
      ),
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
  {
    provide: TYPES.CreateTaskUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.SectionRepository,
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.CreateRuleUsecase,
      TYPES.AddTagsForMemberUsecase,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      tagRepo: TagRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      createRuleUsecase: CreateRuleUsecase,
      addTagsForMemberUsecase: AddTagsForMemberUsecase,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new CreateTaskUsecase(
        taskRepo,
        tagRepo,
        listRepo,
        memberRepo,
        createRuleUsecase,
        addTagsForMemberUsecase,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.CreateTaskWithSectionUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.SectionRepository,
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.CreateRuleUsecase,
      TYPES.AddTagsForMemberUsecase,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      sectionRepo: SectionRepository,
      tagRepo: TagRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      createRuleUsecase: CreateRuleUsecase,
      addTagsForMemberUsecase: AddTagsForMemberUsecase,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new CreateTaskWithSection(
        taskRepo,
        sectionRepo,
        tagRepo,
        listRepo,
        memberRepo,
        createRuleUsecase,
        addTagsForMemberUsecase,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.DeleteTaskUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.RuleRepository,
      TYPES.SectionRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      ruleRepo: RuleRepository,
      sectionRepo: SectionRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new DeleteTaskUsecase(
        taskRepo,
        ruleRepo,
        sectionRepo,
        listRepo,
        memberRepo,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.GetAllTaskUsecase,
    inject: [TYPES.TaskRepository],
    useFactory: (taskRepo: TaskRepository) => new GetAllTasksUsecase(taskRepo),
  },
  {
    provide: TYPES.GetTaskByIdUsecase,
    inject: [TYPES.TaskRepository],
    useFactory: (taskRepo: TaskRepository) => new GetTaskByIdUsecase(taskRepo),
  },
  {
    provide: TYPES.MoveToSectionUsecase,
    inject: [TYPES.TaskRepository, TYPES.SectionRepository,TYPES.ListRepository, TYPES.UnitWork],
    useFactory: (
      taskRepo: TaskRepository,
      sectionRepo: SectionRepository,
      listRepo:ListRepository,
      unitWork: UnitWorkMongo,
    ) => new MoveToSectionUsecase(taskRepo, sectionRepo,listRepo, unitWork),
  },
  {
    provide: TYPES.GetTodayUsecase,
    inject: [TYPES.TaskRepository],
    useFactory: (taskRepo: TaskRepository) => new GetTodayUsecase(taskRepo),
  },
  {
    provide: TYPES.GetUpcomingUsecase,
    inject: [TYPES.TaskRepository],
    useFactory: (taskRepo: TaskRepository) => new GetUpcomingUsecase(taskRepo),
  },
  {
    provide: TYPES.UpdateRuleUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.RuleRepository,
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.AddTagsForMemberUsecase,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      ruleRepo: RuleRepository,
      tagRepo: TagRepository,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      addTagsForMemberUsecase: AddTagsForMemberUsecase,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateRuleUsecase(
        taskRepo,
        ruleRepo,
        tagRepo,
        listRepo,
        memberRepo,
        addTagsForMemberUsecase,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.updateTaskStatusUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.calculateDeadLineService,
      TYPES.RuleRepository,
      TYPES.SectionRepository,
      TYPES.MemberRepository,
      TYPES.ListRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      calculateDeadLineService: CaculateDeadLine,
      ruleRepo: RuleRepository,
      sectionRepo: SectionRepository,
      memberRepo: MemberRepository,
      listRepo: ListRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateStatusUsecase(
        taskRepo,
        calculateDeadLineService,
        ruleRepo,
        sectionRepo,
        memberRepo,
        listRepo,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.UpdateTaskUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.UpdateRuleUsecase,
      TYPES.MoveToSectionUsecase,
      TYPES.ListRepository,
      TYPES.MemberRepository,
      TYPES.Publisher,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      updateRuleUsecase: UpdateRuleUsecase,
      moveToSectionUsecase: MoveToSectionUsecase,
      listRepo: ListRepository,
      memberRepo: MemberRepository,
      publisher: Publisher,
      unitWork: UnitWorkMongo,
    ) =>
      new UpdateTaskUsecase(
        taskRepo,
        updateRuleUsecase,
        moveToSectionUsecase,
        listRepo,
        memberRepo,
        publisher,
        unitWork,
      ),
  },
  {
    provide: TYPES.GetProfileUsecase,
    inject: [TYPES.UserRepository],
    useFactory: (userRepo: UserRepository) => new GetProfileUsecase(userRepo),
  },
  {
    provide: TYPES.putProfileUsecase,
    inject: [TYPES.UserRepository, TYPES.UnitWork],
    useFactory: (userRepo: UserRepository, unitWork: UnitWorkMongo) =>
      new PutProfileUsecase(userRepo, unitWork),
  },
  {
    provide: TYPES.WorkSpaceUsecase,
    inject: [TYPES.TagRepository, TYPES.ListRepository, TYPES.FilterRepository],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      filterRepo: FilterRepository,
    ) => new WorkSpaceUsecase(tagRepo, listRepo, filterRepo),
  },
  {
    provide:TYPES.putAvatarUsecase,
    inject:[TYPES.UserRepository,TYPES.Publisher,TYPES.UnitWork],
    useFactory:(userRepo:UserRepository,pub:Publisher,unitWork:UnitWorkMongo)=>new PutAvatarUsecase(userRepo,pub,unitWork)
  }
  ,
    {
    provide:TYPES.deleteAvatarUsecase,
    inject:[TYPES.UserRepository,TYPES.Publisher,TYPES.UnitWork],
    useFactory:(userRepo:UserRepository,pub:Publisher,unitWork:UnitWorkMongo)=>new DeleteAvatarUsecase(userRepo,pub,unitWork)
  }
];

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: TYPES.DatabaseType,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const client = await MongodbClient.getInstance(
          config.getOrThrow<string>('MONGODB_URI'),
        );
        const databaseModels = await DatabaseModels.getInstance(
          client.getClient(),
        );
        return databaseModels;
      },
    },
    {
      provide: TYPES.Cache,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const client = RedisCache.getInstance(
          config.getOrThrow<string>('REDIS_URI'),
        );
        return client;
      },
    },
    ...mappers,
    ...services,
    ...repositories,
    ...usecase,
  ],
  exports: [
    TYPES.DatabaseType,
    TYPES.Cache,
    ...services.map((r) => r.provide),
    ...mappers.map((r) => r.provide),
    ...repositories.map((r) => r.provide),
    ...usecase.map((r) => r.provide),
  ],
})
export class ContainerModule {}
