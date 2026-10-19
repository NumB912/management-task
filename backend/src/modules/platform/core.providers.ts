import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { GenerateIdService } from '@/infrastructure/services/generateId.service';
import { QueryFilterParser } from '@/infrastructure/services/queryFiltereParser.service';
import { CaculateDeadLine } from '@/application/service/CaculateDeadLineDay.service';

export const coreProviders = [
  { provide: TYPES.generateId, useClass: GenerateIdService },
  { provide: TYPES.QueryFilterParserService, useClass: QueryFilterParser },
  { provide: TYPES.calculateDeadLineService, useClass: CaculateDeadLine },
];
