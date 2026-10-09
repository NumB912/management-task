import { GetInboxUsecase } from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import { Controller, Get, Inject, Req } from '@nestjs/common';

@Controller('inbox')
export class InboxController {
  constructor(
    @Inject(TYPES.GetInboxUsecase)
    private readonly getInboxUC: GetInboxUsecase,
  ) {}

  @Get()
  async get(@Req() req: AuthRequest) {
    const data = await this.getInboxUC.execute({ user_id: req.user.id });
    return { data };
  }
}
