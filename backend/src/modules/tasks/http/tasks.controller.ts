import {
  DeleteTaskUsecase,
  GetTaskByIdUsecase,
  UpdateRuleUsecase,
  UpdateStatusUsecase,
  UpdateTaskUsecase,
} from '@/application';
import { GetAllTasksWithIdsUsecase } from '@/application/usecase/tasks/findManyWithIds.usecase';
import { GetTodayUsecase } from '@/application/usecase/tasks/today.usecase.js';
import { GetUpcomingUsecase } from '@/application/usecase/tasks/upComming.usecase.js';
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
type UpdateStatusBody = Parameters<UpdateStatusUsecase['execute']>[0]['data'];
@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TYPES.UpdateTaskUsecase)
    private readonly updateTaskUC: UpdateTaskUsecase,
    @Inject(TYPES.DeleteTaskUsecase)
    private readonly deleteTaskUC: DeleteTaskUsecase,
    @Inject(TYPES.UpdateRuleUsecase)
    private readonly updateRuleUC: UpdateRuleUsecase,
    @Inject(TYPES.updateTaskStatusUsecase)
    private readonly updateStatusUC: UpdateStatusUsecase,
  ) {}


  // @Get(':taskId')
  // async getById(@Param('taskId') taskId: string) {
  //   const task = await this.getTaskByIdUC.execute(taskId);
  //   return { message: 'Thành công', task };
  // }

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

  @Patch(':taskId/status')
  async updateStatus(
    @Req() req: AuthRequest,
    @Param('taskId') taskId: string,
    @Body() body: UpdateStatusBody,
  ) {
    await this.updateStatusUC.execute({
      data: body,
      taskId,
      userId: req.user.id,
    });
    return { message: 'Thành công' };
  }
}
