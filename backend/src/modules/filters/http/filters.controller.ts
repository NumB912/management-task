import {
  CreateFilterUsecase,
  DeleteFilterUsecase,
  GetAllFiltersUsecase,
  GetFilterByIdUsecase,
  UpdateFilterUsecase,
} from '@/application';
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

type CreateFilterBody = Parameters<CreateFilterUsecase['execute']>[0]['data'];
type UpdateFilterBody = Parameters<UpdateFilterUsecase['execute']>[0]['data'];

@Controller('filters')
export class FiltersController {
  constructor(
    @Inject(TYPES.CreateFilterUsecase)
    private readonly createFilterUC: CreateFilterUsecase,
    @Inject(TYPES.GetAllFilterUsecase)
    private readonly getAllFilterUC: GetAllFiltersUsecase,
    @Inject(TYPES.GetFilterByIdUsecase)
    private readonly getFilterByIdUC: GetFilterByIdUsecase,
    @Inject(TYPES.UpdateFilterUsecase)
    private readonly updateFilterUC: UpdateFilterUsecase,
    @Inject(TYPES.DeleteFilterUsecase)
    private readonly deleteFilterUC: DeleteFilterUsecase,
  ) {}

  @Get()
  async getAll(@Req() req: AuthRequest) {
    const data = await this.getAllFilterUC.execute(req.user.id);
    return { projects: { data } };
  }

  @Post()
  @HttpCode(200)
  async create(@Req() req: AuthRequest, @Body() body: CreateFilterBody) {
    const createFilter = await this.createFilterUC.execute({
      data: body,
      user_id: req.user.id,
    });
    return { tag: createFilter };
  }

  @Get(':filterId')
  async getById(
    @Req() req: AuthRequest,
    @Param('filterId') filterId: string,
  ) {
    const data = await this.getFilterByIdUC.execute({
      id: filterId,
      userId: req.user.id,
    });
    return { ...data };
  }

  @Patch(':filterId')
  async update(
    @Req() req: AuthRequest,
    @Param('filterId') filterId: string,
    @Body() body: UpdateFilterBody,
  ) {
    const data = await this.updateFilterUC.execute({
      data: body,
      id: filterId,
      user_id: req.user.id,
    });
    return { message: 'Thành công', data };
  }

  @Delete(':filterId')
  async delete(@Param('filterId') filterId: string) {
    const data = await this.deleteFilterUC.execute(filterId);
    return { message: 'Thành công', data };
  }
}
