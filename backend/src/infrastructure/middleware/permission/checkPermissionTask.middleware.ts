import { CheckPermissionTaskUsecase } from '@/application';
import {
  HttpMethod,
  PermissionMethodMap,
} from '@/domain/entities/permission.entity';
import { TYPES } from '@/infrastructure/types/dependency.type';
import {
  ForbiddenException,
  Inject,
  Injectable,
  mixin,
  NestMiddleware,
  Type,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export function CheckPermissionTaskMiddleware(
  permissionAndMethod: PermissionMethodMap,
): Type<NestMiddleware> {
  @Injectable()
  class CheckPermissionTaskMiddlewareClass implements NestMiddleware {
    constructor(
      @Inject(TYPES.CheckPermissionTaskUsecase)
      private readonly usecase: CheckPermissionTaskUsecase,
    ) {}

    async use(req: Request, _res: Response, next: NextFunction) {
      try {
        const taskId =
          (req.params as { taskId?: string }).taskId ??
          req.originalUrl.match(/\/tasks\/([^/?#]+)/)?.[1];

        const user = req.user as { id: string } | undefined;

        if (!user || !taskId) {
          throw new ForbiddenException('Không có quyền truy cập');
        }

        const allowed = await this.usecase.execute(
          user.id,
          taskId,
          permissionAndMethod,
          req.method as HttpMethod,
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

  return mixin(CheckPermissionTaskMiddlewareClass);
}