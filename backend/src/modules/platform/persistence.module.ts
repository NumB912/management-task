import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/modules/platform/database.module.js';
import { persistenceProviders } from './persistence.providers.js';
import { TYPES } from '@/infrastructure/types/dependency.type.js';

@Module({
  imports: [DatabaseModule],
  providers: [...persistenceProviders],
  exports: [
    TYPES.TagRepository,
    TYPES.MemberRepository,
    TYPES.UserRepository,
    TYPES.RuleRepository,
    TYPES.TaskRepository,
    TYPES.FilterRepository,
    TYPES.pomodoroRepository,
    TYPES.SectionRepository,
    TYPES.notificationRepository,
    TYPES.ListRepository,
    TYPES.ColorRepository,
    TYPES.UnitWork,
  ],
})
export class PersistenceModule {}
