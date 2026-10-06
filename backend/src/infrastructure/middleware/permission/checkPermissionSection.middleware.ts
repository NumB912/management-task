import { CheckPermissionSectionUsecase } from '@/application';
import {
  HttpMethod,
  PermissionMethodMap,
} from '@/domain/entities/permission.entity';
import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export function checkPermissionSection(
  usecase: CheckPermissionSectionUsecase,
  permissionAndMethod: PermissionMethodMap,
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const sectionId =
        (req.params as { sectionId?: string }).sectionId ??
        req.originalUrl.match(/\/sections\/([^/?#]+)/)?.[1];

      const user = req.user as { id: string } | undefined;

      if (!user || !sectionId) {
        throw new ForbiddenException('Không có quyền truy cập');
      }

      const allowed = await usecase.execute(
        user.id,
        sectionId,
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
  };
}