import {
  CreateTaskUsecase,
  CreateTaskWithSection,
  GetAllTasksUsecase,
} from '@/application';
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

@Controller('lists/:listId')
export class ListTasksController {
  constructor(
    @Inject(TYPES.CreateTaskUsecase)
    private readonly createTaskUC: CreateTaskUsecase,
    @Inject(TYPES.CreateTaskWithSectionUsecase)
    private readonly createTaskWithSectionUC: CreateTaskWithSection,
  ) {}

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

  // @Get('sections/:sectionId/tasks')
  // async getAllInSection(
  //   @Param('listId') listId: string,
  //   @Param('sectionId') sectionId: string,
  // ) {
  //   const data = await this.getAllTaskUC.execute({
  //     section: sectionId,
  //     list: listId,
  //   });
  //   return { message: 'Thành công', data };
  // }

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
