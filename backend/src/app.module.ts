import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module.js';

import { UserModule } from './modules/user/user.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ListsModule } from './modules/lists/lists.module.js';
import { MembersModule } from './modules/members/members.module.js';
import { SectionsModule } from './modules/sections/sections.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { TagsModule } from './modules/tags/tags.module.js';
import { FiltersModule } from './modules/filters/filters.module.js';
import { pomodoroModule } from './modules/pomodoro/pomodoro.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './modules/platform/cache.module.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TaskDetailCache } from './application/service/taskDetailCache.service.js';
import { TaskCacheInterceptor } from './infrastructure/cache/taskCache.interceptor.js';
import { HttpExceptionFilter } from './modules/error/exception-filter.error.js';
import { ColorModule } from './modules/color/color.module.js';
import { StatisticsModule } from './modules/statistics/statistics.module.js';
import { TaskCommentsModule } from './modules/task-comments/task-comments.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule,
    AdminModule,
    UserModule,
    AuthModule,
    ListsModule,
    MembersModule,
    SectionsModule,
    TasksModule,
    TagsModule,
    FiltersModule,
    pomodoroModule,
    WorkspaceModule,
    ColorModule,
    StatisticsModule,
    TaskCommentsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
      errorMessage: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [TaskDetailCache],
      useFactory: (cache: TaskDetailCache) => new TaskCacheInterceptor(cache),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
