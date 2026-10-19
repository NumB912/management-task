import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CheckAdminUsecase } from '@/application/usecase/admin/checkAdmin.usecase.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(CheckAdminUsecase) private readonly checkAdmin: CheckAdminUsecase) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.id;
    if (!await this.checkAdmin.execute(id)) throw new ForbiddenException('Chỉ admin mới được truy cập');
    return true;
  }
}
