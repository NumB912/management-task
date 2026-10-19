import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  FilterRepository,
  TagRepository,
  TaskRepository,
} from '@/infrastructure/repositories/index.js';
import { QueryFilterParser } from '@/infrastructure/services/queryFiltereParser.service';
import { CreateFilterUsecase } from '@/application/usecase/filters/createFilter.usecase.js';
import { DeleteFilterUsecase } from '@/application/usecase/filters/deleteFilter.usecase.js';
import { GetFilterByIdUsecase } from '@/application/usecase/filters/getFilterById.usecase.js';
import { GetAllFiltersUsecase } from '@/application/usecase/filters/getFiltersAll.usecase.js';
import { UpdateFilterUsecase } from '@/application/usecase/filters/updateFilter.usecase.js';

export const filtersProviders = [
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
];
