import {
  DeleteSectionUsecase,
  GetSectionByIdUsecase,
  UpdateSectionUsecase,
} from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import type { AuthRequest } from '@/modules/common/types/authRequest.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  Req,
} from '@nestjs/common';

type UpdateSectionBody = Parameters<UpdateSectionUsecase['execute']>[2];

@Controller('sections')
export class SectionsController {
  constructor(
    @Inject(TYPES.GetSectionByIdUsecase)
    private readonly getSectionByIdUC: GetSectionByIdUsecase,
    @Inject(TYPES.UpdateSectionUsecase)
    private readonly updateSectionUC: UpdateSectionUsecase,
    @Inject(TYPES.DeleteSectionUsecase)
    private readonly deleteSectionUC: DeleteSectionUsecase,
  ) {}

  @Get(':sectionId')
  async getById(@Param('sectionId') sectionId: string) {
    const data = await this.getSectionByIdUC.execute({ sectionId });
    return { message: 'Thành công', data };
  }

  @Put(':sectionId')
  async update(
    @Req() req: AuthRequest,
    @Param('sectionId') sectionId: string,
    @Body() body: UpdateSectionBody,
  ) {
    const data = await this.updateSectionUC.execute(
      sectionId,
      req.user.id,
      body,
    );
    return { message: 'Thành công', data };
  }

  @Delete(':sectionId')
  async delete(
    @Req() req: AuthRequest,
    @Param('sectionId') sectionId: string,
  ) {
    const data = await this.deleteSectionUC.execute({
      sectionId,
      userId: req.user.id,
    });
    return { message: 'Thành công', data };
  }
}
