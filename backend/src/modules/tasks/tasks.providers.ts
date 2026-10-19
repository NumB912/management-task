import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  ListRepository,
  RuleRepository,
  SectionRepository,
  TagRepository,
  TaskRepository,
  ColorRepository,
} from '@/infrastructure/repositories/index.js';
import { TaskDetailCache } from '@/application/service/taskDetailCache.service.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { CaculateDeadLine } from '@/application/service/CaculateDeadLineDay.service';
import { CreateRuleUsecase } from '@/application/usecase/rule/createRule.usecase.js';
import { AddTagsForMemberUsecase } from '@/application/usecase/tag/addTagsForMember.usecase.js';
import { CreateTaskUsecase } from '@/application/usecase/tasks/createTask.usecase.js';
import { CreateTaskWithSection } from '@/application/usecase/tasks/createTaskWithSection.usecase.js';
import { DeleteTaskUsecase } from '@/application/usecase/tasks/deleteTask.usecase.js';
import { GetAllTasksUsecase } from '@/application/usecase/tasks/findAllTask.usecase.js';
import { GetTaskByIdUsecase } from '@/application/usecase/tasks/findByTaskId.usecase.js';
import { MoveToSectionUsecase } from '@/application/usecase/tasks/moveToSection.usecase.js';
import { GetTodayUsecase } from '@/application/usecase/tasks/today.usecase.js';
import { GetUpcomingUsecase } from '@/application/usecase/tasks/upComming.usecase.js';
import { UpdateRuleUsecase } from '@/application/usecase/tasks/updateRule.usecase.js';
import { UpdateTaskUsecase } from '@/application/usecase/tasks/updateTask.usecase.js';
import { GetAllTasksWithIdsUsecase } from '@/application/usecase/tasks/findManyWithIds.usecase';
import { UpdateStatusUsecase } from '@/application/usecase/tasks/updateTaskStatus.usecase';

export const tasksProviders = [
  {
    provide: TYPES.CreateTaskUsecase,
    inject: [
      TYPES.TaskRepository,
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
    provide: TYPES.GetAllTasksWithIdsUsecase,
    inject: [TYPES.TaskRepository, TYPES.UnitWork],
    useFactory: (taskRepo: TaskRepository, unitWork: UnitWorkMongo) =>
      new GetAllTasksWithIdsUsecase(taskRepo, unitWork),
  },
  {
    provide: TYPES.GetAllTaskUsecase,
    inject: [TYPES.TaskRepository],
    useFactory: (taskRepo: TaskRepository) => new GetAllTasksUsecase(taskRepo),
  },
  {
    provide: TYPES.GetTaskByIdUsecase,
    inject: [TYPES.TaskRepository, TaskDetailCache],
    useFactory: (taskRepo: TaskRepository, cache: TaskDetailCache) =>
      new GetTaskByIdUsecase(taskRepo, cache),
  },
  {
    provide: TYPES.MoveToSectionUsecase,
    inject: [
      TYPES.TaskRepository,
      TYPES.SectionRepository,
      TYPES.ListRepository,
      TYPES.UnitWork,
    ],
    useFactory: (
      taskRepo: TaskRepository,
      sectionRepo: SectionRepository,
      listRepo: ListRepository,
      unitWork: UnitWorkMongo,
    ) => new MoveToSectionUsecase(taskRepo, sectionRepo, listRepo, unitWork),
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
      TYPES.ColorRepository,
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
      colorRepo: ColorRepository,
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
        colorRepo,
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
];
