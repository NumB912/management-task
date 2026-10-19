import { Scope } from '@nestjs/common';
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
  ColorRepository,
} from '@/infrastructure/repositories/index.js';
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository.js';
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
  ColorMapper,
} from '@infrastructure/mapper';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';

export const persistenceProviders = [
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
  { provide: TYPES.ColorMapper, useClass: ColorMapper },
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
  { provide: TYPES.ColorRepository, useClass: ColorRepository },
  { provide: TYPES.UnitWork, useClass: UnitWorkMongo, scope: Scope.REQUEST },
];
