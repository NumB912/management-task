import { CheckOwnerTagUsecase } from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class CheckOwnerTagMiddleware implements NestMiddleware {
  constructor(
    @Inject(TYPES.CheckOwnerTagUsecase)
    private readonly usecase: CheckOwnerTagUsecase,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const { tagId } = req.params as { tagId: string };
      const user = req.user as unknown as {
        id: string;
        role: string;
        email: string;
      };
      if (!user || !tagId) {
        throw new ForbiddenException('Không có quyền thực thi');
      }
      const isPermission = await this.usecase.execute(user.id, tagId);
      if (!isPermission) {
        throw new ForbiddenException('Không có quyền thực thi');
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
