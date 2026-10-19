import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { pomodoroRepository } from '@/infrastructure/repositories/index.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import {
  CreatePomodoroUsecase,
  DeletePomodoroUsecase,
  GetPomodoroUsecase,
  UpdatePomodoroUsecase,
} from '@/application/usecase/pomodoro';

export const pomodoroProviders = [
  {
    provide: TYPES.createpomodoroUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo: pomodoroRepository, unitWork: UnitWorkMongo) =>
      new CreatePomodoroUsecase(pomodoroRepo, unitWork),
  },
  {
    provide: TYPES.DeletePomodoroUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo: pomodoroRepository, unitWork: UnitWorkMongo) =>
      new DeletePomodoroUsecase(pomodoroRepo, unitWork),
  },
  {
    provide: TYPES.updatePomodoUsecase,
    inject: [TYPES.pomodoroRepository, TYPES.UnitWork],
    useFactory: (pomodoroRepo: pomodoroRepository, unitWork: UnitWorkMongo) =>
      new UpdatePomodoroUsecase(pomodoroRepo, unitWork),
  },
  {
    provide: TYPES.GetPomodoroUsecase,
    inject: [TYPES.pomodoroRepository],
    useFactory: (pomodoroRepo: pomodoroRepository) =>
      new GetPomodoroUsecase(pomodoroRepo),
  },
];
