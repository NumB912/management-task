import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GetAdminUsersUsecase } from '@/application/usecase/admin/getAdminUsers.usecase.js';
import { AdminGuard } from '@/infrastructure/guards/admin.guard.js';
import { UpdateAdminUserUsecase } from '@/application/usecase/admin/updateAdminUser.usecase.js';
import { GetAdminActivityUsecase } from '@/application/usecase/admin/getAdminActivity.usecase.js';
import { GetAdminUserWorkStatisticsUsecase } from '@/application/usecase/admin/getAdminUserWorkStatistics.usecase.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @Inject(GetAdminUsersUsecase)
    private readonly getUsers: GetAdminUsersUsecase,
    @Inject(UpdateAdminUserUsecase)
    private readonly updateUserUsecase: UpdateAdminUserUsecase,
    @Inject(GetAdminActivityUsecase)
    private readonly getActivity: GetAdminActivityUsecase,
    @Inject(GetAdminUserWorkStatisticsUsecase)
    private readonly getWorkStatistics: GetAdminUserWorkStatisticsUsecase,
  ) {}
  @Get('activity')
  activity(@Query('days') days?: string, @Query('userId') userId?: string) {
    return this.getActivity.execute({ days, userId });
  }
  @Get('users')
  users(@Query('page') page?: string, @Query('search') search?: string) {
    return this.getUsers.execute({ page, search });
  }
  @Patch('users/:id')
  updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.updateUserUsecase.execute(req.user!.id, id, body);
  }
  @Get('users/:id/statistics')
  userWorkStatistics(
    @Param('id') userId: string,
    @Query('days') days?: string,
  ) {
    return this.getWorkStatistics.execute({ userId, days });
  }
}
