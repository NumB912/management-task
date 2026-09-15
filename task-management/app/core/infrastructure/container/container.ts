import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";
import { TYPES } from "./type.container";
import RedisCache from "../cache/redis.cache";
import RabbitMQ from "../event/rabbit.event";
import Publisher from "../event/publisher.event";
import Consumer from "../event/consumer.event";
import OTPService from "../service/otp.service";
import { RuleRepository, FilterRepository, ListRepository, MemberRepository, SectionRepository, TagRepository, TaskRepository, UserRepository, PromodoRepository } from "../repositories";
import { DatabaseModels } from "../repositories/database/clientSchema.database";
import { UnitWorkMongo } from "../repositories/unitWork/mongoUnitWork.repository";
import {
  AddTagsForMemberUsecase, ChangePasswordUsecase, ChangeRoleUsecase, CheckOwnerTagUsecase,
  CheckOwnerUsecase, CheckPermissionListUsecase, ConfirmOtpUsecase, CreateFilterUsecase,
  CreateListUsecase, CreateRuleUsecase, CreateSectionUsecase, CreateTagUsecase, CreateTaskUsecase,
  DeleteFilterUsecase, DeleteListUsecase, DeleteMemberUsecase, DeleteSectionUsecase,
  DeleteTagOnlyMeUsecase, DeleteTagWithShareUsecase, DeleteTaskUsecase, GetAllFiltersUsecase,
  GetAllSectionUsecase, GetFilterByIdUsecase, GetListByIdUsecase, GetSectionByIdUsecase,
  GetTagByIdUsecase, InitListUsecase, InviteMemberUsecase, SearchMemberUsecase,
  SendChangePasswordUsecase, SendOtpUsecase, StatusInviteUsecase, UpdateFilterUsecase,
  UpdateListUsecase, UpdateRuleUsecase, UpdateSectionUsecase, UpdateTagOnlyMeUsecase,
  UpdateTaskUsecase, GetAllListUsecase,
  GetTaskByIdUsecase,
  CreatePromodoUsecase,
} from "@/app/core/application";
import { GetAllTagsUsecase } from "../../application/usecase/tag/getAllTag.usecase";
import { UpdateTagUsecase } from "../../application/usecase/tag/updateTagWithShare.usecase";
import { SyncMemberTagsUseCase } from "../../application/usecase/tag/SynsMemberTag.usecase";
import { CaculateDeadLine } from "../../application/service/CaculateDeadLineDay.service";
import HashService from "../service/hash.service";
import TokenService from "../service/token.service";
import { UpdateStatusUsecase } from "../../application/usecase/task/updateStatusTask.usecase";
import { RegisterEmailUsecase } from "../../application/usecase/user/register.usecase";
import { LoginWithEmailUseCase } from "../../application/usecase/user/login.usecase";
import { GetAllTasksUsecase } from "../../application/usecase/task/findAllTask.usecase";
import { RuleMapper } from "../repositories/mapper/rule.mapper";
import { TagMapper } from "../repositories/mapper/tag.mapper";
import { UserMapper } from "../repositories/mapper/user.mapper";
import { TaskMapper } from "../repositories/mapper/task.mapper";
import { SectionMapper } from "../repositories/mapper/section.mapper";
import { ListMapper } from "../repositories/mapper/list.mapper";
import { MemberMapper } from "../repositories/mapper/member.mapper";
import { FilterMapper } from "../repositories/mapper/filter.mapper";
import { PromodoMapper } from "../repositories/mapper/promodo.mapper";
import { RefreshTokenUseCase } from "../../application/usecase/user/refresh_token.usecase";
import { ICache } from "../../domain";
import { WorkSpaceUsecase } from "../../application/usecase/workSpace/workspace.usecase";
import { QueryFilterParser } from "../service/queryFiltereParser.service";
import { GetProfileUsecase } from "../../application/usecase/user/getProfile.usecase";
import { GetInboxUsecase } from "../../application/usecase/list/getInbox.usecase";
import { CheckPermissionSectionUsecase } from "../../application/usecase/member/checkPermissionSection.usecase";
import { CheckPermissionTaskUsecase } from "../../application/usecase/member/checkPremissionTask.usecase";
import { CreateTaskWithSection } from "../../application/usecase/task/createTaskWithSection.usecase";
import { ChangePositionSectionUsecase } from "../../application/usecase/section/changeOrderSection.usecase";
import { SortSectionUsecase } from "../../application/usecase/list/sortSection.usecase";
import { MoveToSectionUsecase } from "../../application/usecase/task/moveToSection.usecase";
import { GetAllListSectionUsecase } from "../../application/usecase/list/getListSection.usecase";
import { GetTodayUsecase } from "../../application/usecase/task/today.usecase";
import { GetUpcomingUsecase } from "../../application/usecase/task/upComming.usecase";
import { GetPromodoUsecase } from "../../application/usecase/promodo/getPromodo.usecase";

export class Container {
  private static instancePromise: Promise<DependencyContainer> | null = null;
  private readonly c: DependencyContainer;
  private constructor() {
    this.c = container;
  }

  public static async getInstance(): Promise<DependencyContainer> {
    if (process.env.NEXT_RUNTIME !== "nodejs" && process.env.NEXT_RUNTIME !== undefined) {
      throw new Error("Container chỉ được khởi tạo ở Node.js runtime, không phải Edge runtime.");
    }
    Container.instancePromise ??= new Container().setUp();
    return Container.instancePromise;
  }

  private async setUp(): Promise<DependencyContainer> {
    const db = await DatabaseModels.getInstance();
    await this.registerMessageQueue();
    this.registerUnitWork();
    this.registerMapper();
    this.registerInfrastructure(db);
    this.registerIcache();
    this.registerMiddleware();
    this.registerInitUsecases();
    this.registerWorkSpace();
    this.registerUserUsecase()
    this.registerMemberUsecases();
    this.registerListUsecases();
    this.registerSectionUsecases();
    this.registerTagUsecases();
    this.registerFilterUsecase();
    this.registerRuleUsecase();
    this.registerTaskUsecase();
    this.registerTaskStatusUsecase();
    this.registerService();
    this.registerAuthUsecase();
    this.registerPromodoUsecases()
    return this.c;
  }

  private registerInfrastructure(db: DatabaseModels): void {
    this.c.register(TYPES.DatabaseType, { useValue: db });
    this.c.register(TYPES.ListRepository, { useClass: ListRepository });
    this.c.register(TYPES.RuleRepository, { useClass: RuleRepository });
    this.c.register(TYPES.TaskRepository, { useClass: TaskRepository });
    this.c.register(TYPES.SectionRepository, { useClass: SectionRepository });
    this.c.register(TYPES.TagRepository, { useClass: TagRepository });
    this.c.register(TYPES.FilterRepository, { useClass: FilterRepository });
    this.c.register(TYPES.UserRepository, { useClass: UserRepository });
    this.c.register(TYPES.MemberRepository, { useClass: MemberRepository });
    this.c.register(TYPES.PromodoRepository, { useClass: PromodoRepository });
  }

  private registerUnitWork(): void {
    this.c.register(TYPES.UnitWork, { useClass: UnitWorkMongo });
  }

  private registerMemberUsecases(): void {
    this.c.register(TYPES.CheckPermissionListUsecase, { useFactory: (c) => new CheckPermissionListUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.ListRepository)) });
    this.c.register(TYPES.CheckPermissionSectionUsecase, { useFactory: (c) => new CheckPermissionSectionUsecase(c.resolve(TYPES.SectionRepository), c.resolve(TYPES.CheckPermissionListUsecase)) });
    this.c.register(TYPES.CheckPermissionTaskUsecase, { useFactory: (c) => new CheckPermissionTaskUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.CheckPermissionListUsecase)) });
    this.c.register(TYPES.InviteMemberUsecase, { useFactory: (c) => new InviteMemberUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.UserRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.SearchMemberUsecase, { useFactory: (c) => new SearchMemberUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.UserRepository)) });
    this.c.register(TYPES.DeleteMemberUsecase, { useFactory: (c) => new DeleteMemberUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.ChangeRoleUsecase, { useFactory: (c) => new ChangeRoleUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.StatusInviteUsecase, { useFactory: (c) => new StatusInviteUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.SynsMemberTagUsecase), c.resolve(TYPES.UnitWork)) });
  }

  private registerListUsecases(): void {
    this.c.register(TYPES.GetAllListUsecase, { useFactory: (c) => new GetAllListUsecase(c.resolve(TYPES.ListRepository)) });
    this.c.register(TYPES.GetListByIdUsecase, { useFactory: (c) => new GetListByIdUsecase(c.resolve(TYPES.ListRepository)) });
    this.c.register(TYPES.CreateListUsecase, { useFactory: (c) => new CreateListUsecase(c.resolve(TYPES.InitListUsecase), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.UpdateListUsecase, { useFactory: (c) => new UpdateListUsecase(c.resolve(TYPES.ListRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.DeleteListUsecase, {
      useFactory: (c) => new DeleteListUsecase(c.resolve(TYPES.ListRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.TaskRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.MemberRepository), c.resolve(TYPES.UnitWork)),
    });

       this.c.register(TYPES.GetAllListSectionUsecase, { useFactory: (c) => new GetAllListSectionUsecase(c.resolve(TYPES.ListRepository)) });
 
      this.c.register(TYPES.SortSectionUsecase, { useFactory: (c) => new SortSectionUsecase(c.resolve(TYPES.ListRepository),c.resolve(TYPES.UnitWork)) });
 
    this.c.register(TYPES.GetInboxUsecase, { useFactory: (c) => new GetInboxUsecase(c.resolve(TYPES.ListRepository)) });
  }

  private registerInitUsecases(): void {
    this.c.register(TYPES.InitListUsecase, { useFactory: (c) => new InitListUsecase(c.resolve(TYPES.ListRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.MemberRepository)) });
  }

  private registerMiddleware(): void {
    this.c.register(TYPES.CheckOwnerUsecase, { useFactory: (c) => new CheckOwnerUsecase(c.resolve(TYPES.ListRepository)) });
    this.c.register(TYPES.CheckOwnerTagUsecase, { useFactory: (c) => new CheckOwnerTagUsecase(c.resolve(TYPES.TagRepository)) });
  }

  private registerSectionUsecases(): void {
    this.c.register(TYPES.GetAllSectionUsecase, { useFactory: (c) => new GetAllSectionUsecase(c.resolve(TYPES.SectionRepository)) });
    this.c.register(TYPES.GetSectionByIdUsecase, { useFactory: (c) => new GetSectionByIdUsecase(c.resolve(TYPES.SectionRepository)) });
    this.c.register(TYPES.DeleteSectionUsecase, {
      useFactory: (c) => new DeleteSectionUsecase(c.resolve(TYPES.SectionRepository), c.resolve(TYPES.TaskRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.UnitWork)),
    });
    this.c.register(TYPES.ChangePositionSectionUsecase, {
      useFactory: (c) => new ChangePositionSectionUsecase(c.resolve(TYPES.SectionRepository), c.resolve(TYPES.UnitWork)),
    });
    this.c.register(TYPES.CreateSectionUsecase, { useFactory: (c) => new CreateSectionUsecase(c.resolve(TYPES.SectionRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.UpdateSectionUsecase, { useFactory: (c) => new UpdateSectionUsecase(c.resolve(TYPES.SectionRepository), c.resolve(TYPES.UnitWork)) });
  }

  private registerTagUsecases(): void {
    this.c.register(TYPES.GetAllTagUsecase, { useFactory: (c) => new GetAllTagsUsecase(c.resolve(TYPES.TagRepository)) });
    this.c.register(TYPES.CreateTagUsecase, { useFactory: (c) => new CreateTagUsecase(c.resolve(TYPES.TagRepository)) });
    this.c.register(TYPES.GetTagByIdUsecase, { useFactory: (c) => new GetTagByIdUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.TaskRepository)) });
    this.c.register(TYPES.DeleteTagUsecase, { useFactory: (c) => new DeleteTagWithShareUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.DeleteTagOnlyMeUsecase, { useFactory: (c) => new DeleteTagOnlyMeUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.UpdateTagUsecase, { useFactory: (c) => new UpdateTagUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.AddTagsForMemberUsecase), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.UpdateTagOnlyMeUsecase, { useFactory: (c) => new UpdateTagOnlyMeUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.SynsMemberTagUsecase, { useFactory: (c) => new SyncMemberTagsUseCase(c.resolve(TYPES.TagRepository)) });
    this.c.register(TYPES.AddTagsForMemberUsecase, { useFactory: (c) => new AddTagsForMemberUsecase(c.resolve(TYPES.MemberRepository), c.resolve(TYPES.SynsMemberTagUsecase)) });
  }

  private registerPromodoUsecases(): void {
    this.c.register(TYPES.createPromodoUsecase, { useFactory: (c) => new CreatePromodoUsecase(c.resolve(TYPES.PromodoRepository),c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.getPromodoUsecase, { useFactory: (c) => new GetPromodoUsecase(c.resolve(TYPES.PromodoRepository),c.resolve(TYPES.UnitWork)) });
  }

  private registerFilterUsecase(): void {
    this.c.register(TYPES.CreateFilterUsecase, { useFactory: (c) => new CreateFilterUsecase(c.resolve(TYPES.FilterRepository), c.resolve(TYPES.TagRepository), c.resolve(TYPES.QueryFilterParserService)) });
    this.c.register(TYPES.GetFilterByIdUsecase, { useFactory: (c) => new GetFilterByIdUsecase(c.resolve(TYPES.FilterRepository), c.resolve(TYPES.TaskRepository)) });
    this.c.register(TYPES.DeleteFilterUsecase, { useFactory: (c) => new DeleteFilterUsecase(c.resolve(TYPES.FilterRepository)) });
    this.c.register(TYPES.GetAllFilterUsecase, { useFactory: (c) => new GetAllFiltersUsecase(c.resolve(TYPES.FilterRepository)) });
    this.c.register(TYPES.UpdateFilterUsecase, { useFactory: (c) => new UpdateFilterUsecase(c.resolve(TYPES.FilterRepository)) });
  }

  private registerTaskUsecase(): void {
    this.c.register(TYPES.CreateTaskUsecase, {
      useFactory: (c) => new CreateTaskUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.CreateRuleUsecase), c.resolve(TYPES.AddTagsForMemberUsecase), c.resolve(TYPES.UnitWork)),
    });
    this.c.register(TYPES.CreateTaskWithSectionUsecase, {
      useFactory: (c) => new CreateTaskWithSection(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.CreateRuleUsecase), c.resolve(TYPES.AddTagsForMemberUsecase), c.resolve(TYPES.UnitWork)),
    });

     this.c.register(TYPES.MoveToSectionUsecase, {
      useFactory: (c) => new MoveToSectionUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.SectionRepository),c.resolve(TYPES.UnitWork)),
    });
     this.c.register(TYPES.GetTodayUsecase, { useFactory: (c) => new GetTodayUsecase(c.resolve(TYPES.TaskRepository)) });
       this.c.register(TYPES.GetUpcomingUsecase, { useFactory: (c) => new GetUpcomingUsecase(c.resolve(TYPES.TaskRepository)) });
  
    this.c.register(TYPES.GetTaskByIdUsecase, { useFactory: (c) => new GetTaskByIdUsecase(c.resolve(TYPES.TaskRepository)) });
    this.c.register(TYPES.DeleteTaskUsecase, { useFactory: (c) => new DeleteTaskUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.UpdateTaskUsecase, { useFactory: (c) => new UpdateTaskUsecase(c.resolve(TYPES.TaskRepository),c.resolve(TYPES.UpdateRuleUsecase),c.resolve(TYPES.MoveToSectionUsecase), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.GetAllTaskUsecase, { useFactory: (c) => new GetAllTasksUsecase(c.resolve(TYPES.TaskRepository)) });
  }

  private registerRuleUsecase(): void {
    this.c.register(TYPES.UpdateRuleUsecase, { useFactory: (c) => new UpdateRuleUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.TagRepository),c.resolve(TYPES.ListRepository),c.resolve(TYPES.AddTagsForMemberUsecase), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.CreateRuleUsecase, { useFactory: (c) => new CreateRuleUsecase(c.resolve(TYPES.RuleRepository)) });
  }

  private registerService(): void {
    this.c.register(TYPES.calculateDeadLineService, { useFactory: () => new CaculateDeadLine() });
    this.c.register(TYPES.HashService, { useFactory: () => new HashService() });
    this.c.register(TYPES.TokenService, { useFactory: () => new TokenService() });
    this.c.register(TYPES.OtpService, { useFactory: (c) => new OTPService(c.resolve(TYPES.Cache)) });
    this.c.register(TYPES.QueryFilterParserService, { useFactory: (c) => new QueryFilterParser() })
  }

  private registerTaskStatusUsecase(): void {
    this.c.register(TYPES.updateTaskStatusUsecase, { useFactory: (c) => new UpdateStatusUsecase(c.resolve(TYPES.TaskRepository), c.resolve(TYPES.calculateDeadLineService), c.resolve(TYPES.RuleRepository), c.resolve(TYPES.SectionRepository), c.resolve(TYPES.UnitWork)) });
  }

  private registerAuthUsecase(): void {
    this.c.register(TYPES.RegisterEmailUsecase, { useFactory: (c) => new RegisterEmailUsecase(c.resolve(TYPES.UserRepository), c.resolve(TYPES.InitListUsecase), c.resolve(TYPES.HashService), c.resolve(TYPES.UnitWork)) });
    this.c.register(TYPES.LoginWithEmailUseCase, { useFactory: (c) => new LoginWithEmailUseCase(c.resolve(TYPES.UserRepository), c.resolve(TYPES.HashService), c.resolve(TYPES.TokenService), c.resolve(TYPES.Cache)) });
    this.c.register(TYPES.ResetPasswordUsecase, { useFactory: (c) => new ChangePasswordUsecase(c.resolve(TYPES.UserRepository), c.resolve(TYPES.TokenService), c.resolve(TYPES.HashService), c.resolve(TYPES.Cache)) });
    this.c.register(TYPES.SendResetPasswordUsecase, { useFactory: (c) => new SendChangePasswordUsecase(c.resolve(TYPES.Publisher), c.resolve(TYPES.TokenService), c.resolve(TYPES.Cache), c.resolve(TYPES.UserRepository)) });
    this.c.register(TYPES.SendOtpUsecase, { useFactory: (c) => new SendOtpUsecase(c.resolve(TYPES.Publisher), c.resolve(TYPES.OtpService), c.resolve(TYPES.UserRepository)) });
    this.c.register(TYPES.ConfirmOtpUsecase, { useFactory: (c) => new ConfirmOtpUsecase(c.resolve(TYPES.OtpService), c.resolve(TYPES.TokenService), c.resolve(TYPES.Cache)) });
    this.c.register(TYPES.RefreshUsecase, { useFactory: (c) => new RefreshTokenUseCase(c.resolve(TYPES.Cache), c.resolve(TYPES.TokenService), c.resolve(TYPES.UserRepository)) });
  }

  private registerUserUsecase(): void {
    this.c.register(TYPES.GetProfileUsecase, { useFactory: (c) => new GetProfileUsecase(c.resolve(TYPES.UserRepository)) })
  }

  private registerMapper(): void {
    this.c.register(TYPES.UserMapper, { useValue: new UserMapper() });
    this.c.register(TYPES.TagMapper, { useValue: new TagMapper(this.c.resolve(TYPES.UserMapper)) });
    this.c.register(TYPES.RuleMapper, { useValue: new RuleMapper() });
    this.c.register(TYPES.TaskMapper, { useValue: new TaskMapper(this.c.resolve(TYPES.RuleMapper)) });
    this.c.register(TYPES.SectionMapper, { useValue: new SectionMapper(this.c.resolve(TYPES.TaskMapper)) });
    this.c.register(TYPES.ListMapper, { useValue: new ListMapper(this.c.resolve(TYPES.UserMapper), this.c.resolve(TYPES.SectionMapper)) });
    this.c.register(TYPES.MemberMapper, { useValue: new MemberMapper(this.c.resolve(TYPES.UserMapper)) });
    this.c.register(TYPES.FilterMapper, { useValue: new FilterMapper(this.c.resolve(TYPES.TagMapper), this.c.resolve(TYPES.UserMapper)) });
    this.c.register(TYPES.PromodoMapper, { useValue: new PromodoMapper() });
  }

  private registerIcache(): void {
    this.c.register<ICache>(TYPES.Cache, { useFactory: () => RedisCache.getInstance() });
  }

  private async registerMessageQueue(): Promise<void> {
    const publisher = await Publisher.create();
    const consumer = await Consumer.create();
    this.c.register<RabbitMQ>(TYPES.MessageQueue, { useFactory: () => RabbitMQ.getInstance() });
    this.c.register(TYPES.Publisher, { useFactory: () => publisher });
    this.c.register(TYPES.Consumer, { useFactory: () => consumer });
  }

  private registerWorkSpace(): void {
    this.c.register(TYPES.WorkSpaceUsecase, { useFactory: (c) => new WorkSpaceUsecase(c.resolve(TYPES.TagRepository), c.resolve(TYPES.ListRepository), c.resolve(TYPES.FilterRepository)) });
  }
}

export async function GetContainer(): Promise<DependencyContainer> {
  return Container.getInstance();
}