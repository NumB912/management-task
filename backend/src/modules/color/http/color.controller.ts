import {
  ChangeRoleUsecase,
  DeleteMemberUsecase,
  ExitMemberUsecase,
  InviteMemberUsecase,
  SearchMemberUsecase,
  StatusInviteUsecase,
} from '@/application';
import { UpdateColorUsecase } from '@/application/usecase/color/update.color';
import { ITypeColor } from '@/domain';
import { ZodValidationPipe } from '@/infrastructure/pipe/zod.pipe';
import { TYPES } from '@/infrastructure/types/dependency.type';
import { colorSchema,type IColorInput } from '@/infrastructure/validate/color/color.validate';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  Patch,
  Req,
} from '@nestjs/common';

@Controller('colors')
export class ColorController {
  constructor(
    @Inject(TYPES.UpdateColorUC)
    private readonly updateColorUC: UpdateColorUsecase,
  ) {}

  @Patch("/task/:taskId")
  @HttpCode(200)
  async colorRule(
    @Req() req: AuthRequest,
    @Param('taskId') refId: string,
    @Body(new ZodValidationPipe(colorSchema)) body:IColorInput,
  ) {
    await this.updateColorUC.execute({
      data: {
        ...body,
        refId: refId,
        type:"task"
      },
      userId: req.user.id
    });
    return { message: 'Thành công', success: true };
  }

  
  @Patch("/list/:listId")
  @HttpCode(200)
  async colorList(
    @Req() req: AuthRequest,
    @Param('listId') refId: string,
    @Body(new ZodValidationPipe(colorSchema)) body:IColorInput,
  ) {
    await this.updateColorUC.execute({
      data: {
        ...body,
        refId: refId,
        type:"list"
      },
      userId: req.user.id
    });
    return { message: 'Thành công', success: true };
  }
  
}
