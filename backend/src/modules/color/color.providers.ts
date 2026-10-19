import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  ListRepository,
  TaskRepository,
  ColorRepository,
} from '@/infrastructure/repositories/index.js';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository.js';
import { IColorRepository, IListRepository, ITaskRepository } from '@/domain';
import { UpdateColorUsecase } from '@/application/usecase/color/update.color';

export const colorProviders = [
  {
    provide: TYPES.UpdateColorUC,
    inject: [
      TYPES.ColorRepository,
      TYPES.TaskRepository,
      TYPES.ListRepository,
      TYPES.UnitWork,
    ],
    useFactory: (
      colorRepo: IColorRepository,
      taskRepo: ITaskRepository,
      listRepo: IListRepository,
      unitWork: UnitWorkMongo,
    ) => new UpdateColorUsecase(colorRepo, taskRepo, listRepo, unitWork),
  },
];
