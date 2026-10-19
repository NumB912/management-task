import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { RuleRepository } from '@/infrastructure/repositories/index.js';
import { CreateRuleUsecase } from '@/application/usecase/rule/createRule.usecase.js';

export const rulesProviders = [
  {
    provide: TYPES.CreateRuleUsecase,
    inject: [TYPES.RuleRepository],
    useFactory: (ruleRepo: RuleRepository) => new CreateRuleUsecase(ruleRepo),
  },
];
