import {
  DeleteTaskUsecase,
  GetTaskByIdUsecase,
  UpdateRuleUsecase,
  UpdateTaskUsecase,
} from '@/application';
import {  UpdateStatusUsecase } from '@/application/usecase/tasks/updateTaskStatus.usecase';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

type UpdateTaskBody = Parameters<UpdateTaskUsecase['execute']>[0]['data'];
type UpdateRuleBody = Parameters<UpdateRuleUsecase['execute']>[1];
@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TYPES.GetTaskByIdUsecase)
    private readonly getTaskByIdUC: GetTaskByIdUsecase,
    @Inject(TYPES.UpdateTaskUsecase)
    private readonly updateTaskUC: UpdateTaskUsecase,
    @Inject(TYPES.DeleteTaskUsecase)
    private readonly deleteTaskUC: DeleteTaskUsecase,
    @Inject(TYPES.UpdateRuleUsecase)
    private readonly updateRuleUC: UpdateRuleUsecase,
    @Inject(TYPES.updateTaskStatusUsecase)
    private readonly updateStatus:UpdateStatusUsecase
  ) {}


  @Get(':taskId')
  async getById(@Param('taskId') taskId: string) {
    const task = await this.getTaskByIdUC.execute(taskId);
    return { message: 'Thành công', task };
  }

  @Patch('/status')
  async updateStatusArr(
    @Req() req: AuthRequest,
    @Body() body: any,
  ) {

    await this.updateStatus.execute({
      data: body,
      userId: req.user.id,
    });
    return { message: 'Thành công' };
  }

  @Patch(':taskId')
  async update(
    @Req() req: AuthRequest,
    @Param('taskId') taskId: string,
    @Body() body: UpdateTaskBody,
  ) {
    const data = await this.updateTaskUC.execute({
      data: body,
      id: taskId,
      userId: req.user.id,
    });
    return { message: 'Thành công', data };
  }

  @Delete(':taskId')
  async delete(@Req() req: AuthRequest, @Param('taskId') taskId: string) {
    const data = await this.deleteTaskUC.execute(taskId, req.user.id);
    return { message: 'Thành công', data };
  }

  @Patch(':taskId/rule')
  async updateRule(
    @Req() req: AuthRequest,
    @Param('taskId') taskId: string,
    @Body() body: UpdateRuleBody,
  ) {
    const data = await this.updateRuleUC.execute(taskId, body, req.user.id);
    return { message: 'Thành công', data };
  }


}
