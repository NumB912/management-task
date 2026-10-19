import {
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { CheckAccountAccessUsecase } from '@/application/usecase/auth/checkAccountAccess.usecase.js';

@Injectable()
export class CheckAccountStatusMiddleware implements NestMiddleware {
  constructor(
    @Inject(CheckAccountAccessUsecase)
    private readonly checkAccess: CheckAccountAccessUsecase,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const access = await this.checkAccess.execute(req.user?.id);
    if (access === 'missing')
      throw new UnauthorizedException('Tài khoản không tồn tại');
    if (access === 'blocked')
      throw new ForbiddenException({ code: 'ACCOUNT_BLOCKED', message: 'Tài khoản đã bị khóa' });
    next();
  }
}
