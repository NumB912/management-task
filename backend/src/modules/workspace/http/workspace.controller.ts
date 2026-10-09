import { WorkSpaceUsecase } from '@/application';
import { WorkSpaceResult } from '@/application/usecase/workSpace/workspace.usecase';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import { Controller, Get, Inject, Req } from '@nestjs/common';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    @Inject(TYPES.WorkSpaceUsecase)
    private readonly workSpaceUC: WorkSpaceUsecase,
  ) {}

  @Get()
  async get(@Req() req: AuthRequest):Promise<WorkSpaceResult> {
    const data = await this.workSpaceUC.execute({ userId: req.user.id });
    return data;
  }
}
