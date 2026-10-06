import { Module } from '@nestjs/common';

import { UserModule } from './modules/user/user.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ListsModule } from './modules/lists/lists.module.js';
import { ContainerModule } from './modules/container/container.module.js';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './modules/error/exception-filter.error.js';
@Module({
  imports: [
    ContainerModule,
    UserModule,
    AuthModule,
    ListsModule,
  ],
  providers: [{
    provide:APP_FILTER,
    useClass:HttpExceptionFilter
  }],
})
export class AppModule {}