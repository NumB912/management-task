import { Module } from '@nestjs/common';

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
import { ContainerModule } from './modules/container/container.module.js';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './modules/error/exception-filter.error.js';
@Module({
  imports: [
    ContainerModule,
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
  ],
  providers: [{
    provide:APP_FILTER,
    useClass:HttpExceptionFilter
  }],
})
export class AppModule {}
