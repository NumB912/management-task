import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  MemberRepository,
  ListRepository,
  RuleRepository,
  SectionRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import Publisher from '@/infrastructure/event/publisher.event.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { CreateSectionUsecase } from '@/application/usecase/sections/createSection.usecase.js';
import { DeleteSectionUsecase } from '@/application/usecase/sections/deleteSection.usecase.js';
import { GetAllSectionUsecase } from '@/application/usecase/sections/getSectionAll.usecase.js';
import { GetSectionByIdUsecase } from '@/application/usecase/sections/getSectionById.usecase.js';
import { UpdateSectionUsecase } from '@/application/usecase/sections/updateSection.usecase.js';

export const sectionsProviders = [
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
];
