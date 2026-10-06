import { CheckOwnerUsecase } from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class CheckOwnerMiddleware implements NestMiddleware {
  constructor(
    @Inject(TYPES.CheckOwnerUsecase)
    private readonly usecase: CheckOwnerUsecase,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const { listId } = req.params as { listId: string };
      const user = req.user as unknown as {
        id: string;
        role: string;
        email: string;
      };
      if (!user || !listId) {
        throw new ForbiddenException('Không có quyền thực thi');
      }
      const isPermission = await this.usecase.execute(user.id, listId);
      if (!isPermission) {
        throw new ForbiddenException('Không có quyền thực thi');
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
