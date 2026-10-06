import {
  ForbiddenException,
  Inject,
  Injectable,
  mixin,
  NestMiddleware,
  Type,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { CheckPermissionListUsecase } from '@/application';
import * as permissionEntity from '@/domain/entities/permission.entity';
import { TYPES } from '@/infrastructure/types/dependency.type';

export function CheckPermissionListMiddleware(
  permissionAndMethod: permissionEntity.PermissionMethodMap,
): Type<NestMiddleware> {
  @Injectable()
  class Middleware implements NestMiddleware {
    constructor(
      @Inject(TYPES.CheckPermissionListUsecase)
      private readonly usecase: CheckPermissionListUsecase,
    ) {}

    async use(req: Request, _res: Response, next: NextFunction) {
      try {
        console.log("hello")
        const { listId } = req.params as { listId?: string };
        const user = req.user as { id: string } | undefined;
        if (!user || !listId) {
          throw new ForbiddenException('Không có quyền truy cập');
        }
        console.log("helaslkaldj")
        const method = req.method as permissionEntity.HttpMethod;
        const allowed = await this.usecase.execute(
          user.id,
          listId,
          permissionAndMethod,
          method,
        );

        if (!allowed) {
          throw new ForbiddenException('Không có quyền truy cập');
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  }
  return mixin(Middleware);
}