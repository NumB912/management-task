import { VerifyTokenMiddleware } from '@/infrastructure/middleware/auth/verifyToken.middleware.js';
import { CheckOwnerMiddleware } from '@/infrastructure/middleware/permission/checkOwner.middleware.js';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ColorController } from './http/color.controller';
import { CheckPermissionListMiddleware } from '@/infrastructure/middleware/permission/checkPermission.middleware';
import { CheckPermissionTaskMiddleware } from '@/infrastructure/middleware/permission/checkPermissionTask.middleware';
@Module({
  controllers: [ColorController],
})

export class ColorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .forRoutes(ColorController);
    consumer.apply(CheckPermissionListMiddleware({
      "can edit":['PATCH']
    })).forRoutes({
      path:"/colors/list/:listId",
      method:RequestMethod.PATCH,
    })
    consumer.apply(CheckPermissionTaskMiddleware({
      "can edit":['PATCH']
    })).forRoutes({
      path:"/colors/task/:taskId",
      method:RequestMethod.PATCH
    })
  }
}
