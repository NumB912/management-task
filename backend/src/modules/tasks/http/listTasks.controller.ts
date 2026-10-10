import {
  CreateTaskUsecase,
  CreateTaskWithSection,
  GetAllTasksUsecase,
} from '@/application';
import { GetAllTasksWithIdsUsecase } from '@/application/usecase/tasks/findManyWithIds.usecase';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';

type CreateTaskBody = Parameters<CreateTaskUsecase['execute']>[0]['data'];
type CreateTaskWithSectionBody = Parameters<
  CreateTaskWithSection['execute']
>[0]['data'];
type GetAllTaskWithIDs = {
  ids:string[],
}
@Controller('lists/:listId')
export class ListTasksController {
  constructor(
    @Inject(TYPES.CreateTaskUsecase)
    private readonly createTaskUC: CreateTaskUsecase,
    @Inject(TYPES.CreateTaskWithSectionUsecase)
    private readonly createTaskWithSectionUC: CreateTaskWithSection,
        @Inject(TYPES.GetAllTasksWithIdsUsecase)
        private readonly getAllTaskWithIds:GetAllTasksWithIdsUsecase
  ) {}

  @Post('/tasks/by_ids')
    async getByIds(@Req() req: AuthRequest,@Param('listId') listId: string,@Body() dto:GetAllTaskWithIDs) {
      const tasks = await this.getAllTaskWithIds.execute({
        listId:listId,
        userId:req.user.id,
        taskIds:dto.ids
      });
      return { message: 'Thành công', tasks };
    }
  

  @Post('tasks')
  @HttpCode(200)
  async create(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Body() body: CreateTaskBody,
  ) {
    const task = await this.createTaskUC.execute({
      data: body,
      listId,
      userId: req.user.id,
    });
    return { task };
  }

  @Post('sections/:sectionId/tasks')
  @HttpCode(200)
  async createInSection(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Param('sectionId') sectionId: string,
    @Body() body: CreateTaskWithSectionBody,
  ) {
    const task = await this.createTaskWithSectionUC.execute({
      data: body,
      listId,
      sectionId,
      userId: req.user.id,
    });
    return { task };
  }
}
