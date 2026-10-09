import { CreateSectionUsecase, GetAllSectionUsecase } from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';

@Controller('lists/:listId/sections')
export class ListSectionsController {
  constructor(
    @Inject(TYPES.GetAllSectionUsecase)
    private readonly getAllSectionUC: GetAllSectionUsecase,
    @Inject(TYPES.CreateSectionUsecase)
    private readonly createSectionUC: CreateSectionUsecase,
  ) {}

  @Get()
  async getAll(@Req() req: AuthRequest, @Param('listId') listId: string) {
    const data = await this.getAllSectionUC.execute(listId, req.user.id);
    return { message: 'Thành công', data };
  }

  @Post()
  @HttpCode(200)
  async create(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Body() body: { name: string; id: string },
  ) {
    const section = await this.createSectionUC.execute({
      data: { name: body.name, id: body.id },
      user_id: req.user.id,
      list_id: listId,
    });
    return { message: 'Thành công', section };
  }
}
