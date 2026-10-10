
import {  CreatePomodoroUsecase, DeletePomodoroUsecase, GetPomodoroUsecase, UpdatePomodoroUsecase } from '@/application/usecase/pomodoro';
import { Ipomodoro } from '@/domain';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

type CreatepomodoroBody = Parameters<CreatePomodoroUsecase['execute']>[0];
@Controller('pomodoro')
export class pomodoroController {
  constructor(
    @Inject(TYPES.createpomodoroUsecase)
    private readonly createpomodoroUC: CreatePomodoroUsecase,
    @Inject(TYPES.GetPomodoroUsecase)
    private readonly getpomodoroUC: GetPomodoroUsecase,
    @Inject(TYPES.DeletePomodoroUsecase)
    private readonly deletepomodoroUC:DeletePomodoroUsecase,
    @Inject(TYPES.updatePomodoUsecase)
    private readonly UpdatePomodoroUC:UpdatePomodoroUsecase
  ) {}

  @Get()
  async get(@Req() req: AuthRequest) {
    const data = await this.getpomodoroUC.execute(req.user.id);
    return { data };
  }

  @Post()
  @HttpCode(200)
  async create(@Req() req: AuthRequest, @Body() body: CreatepomodoroBody) {
    const data = await this.createpomodoroUC.execute(body, req.user.id);
    return { data };
  }

  @Patch(":id")
  @HttpCode(200)
  async patch(@Req() req:AuthRequest,@Param("id") id:string,@Body() body:Pick<Ipomodoro,"task">){
    console.log(body)
    await this.UpdatePomodoroUC.execute(id,req.user.id,{
      task:body.task
    })
    return 'Thành công'
  }

  @Delete(":id")
  @HttpCode(200)
  async delete(@Req() req:AuthRequest,@Param("id") id:string){
    await this.deletepomodoroUC.execute(id, req.user.id);  
    return 'Thành công'
  }
}
