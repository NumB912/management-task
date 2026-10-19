import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TaskCommentsUsecase } from '@/application/usecase/task-comments/taskComments.usecase.js';

@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(
    @Inject(TaskCommentsUsecase) private readonly comments: TaskCommentsUsecase,
  ) {}
  @Get()
  list(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Query('before') before?: string,
  ) {
    return this.comments.list(req.user!.id, taskId, before);
  }
  @Post()
  create(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Body() body: unknown,
  ) {
    return this.comments.create(req.user!.id, taskId, body);
  }
  @Get(':commentId/replies')
  replies(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Query('before') before?: string,
  ) {
    return this.comments.replies(req.user!.id, taskId, commentId, before);
  }
}
