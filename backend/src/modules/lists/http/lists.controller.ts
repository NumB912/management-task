import {
  CreateListUsecase,
  DeleteListUsecase,
  GetAllListUsecase,
  GetListByIdUsecase,
  GetAllListSectionUsecase,
  GetInboxUsecase,
  SortSectionUsecase,
  UpdateListUsecase,
} from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';

@Controller('lists')
export class ListsController {
  constructor(
    @Inject(TYPES.GetAllListUsecase)
    private readonly getAllListUC: GetAllListUsecase,
    @Inject(TYPES.CreateListUsecase)
    private readonly createListUC: CreateListUsecase,
    @Inject(TYPES.GetListByIdUsecase)
    private readonly getListByIdUC: GetListByIdUsecase,
    @Inject(TYPES.UpdateListUsecase)
    private readonly updateListUC: UpdateListUsecase,
    @Inject(TYPES.DeleteListUsecase)
    private readonly deleteListUC: DeleteListUsecase,
    @Inject(TYPES.GetAllListSectionUsecase)
    private readonly getAllListSectionUC: GetAllListSectionUsecase,
    @Inject(TYPES.SortSectionUsecase)
    private readonly sortSectionUC: SortSectionUsecase,
    @Inject(TYPES.GetInboxUsecase)
    private readonly getInboxUC: GetInboxUsecase,
  ) {}

  @Get()
  async getAll(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ) {
    const user = req.user;
    const lists = await this.getAllListUC.execute({ user_id: user.id });
    return { lists };
  }

  @Post()
  async create(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @Body() body: { name: string },
  ) {
    const user = req.user;
    const createList = await this.createListUC.execute({
      ...body,
      user: user.id,
    });
    return { createList };
  }

  @Get('allListSection')
  async getAllListSection(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ) {
    const user = req.user;
    const lists = await this.getAllListSectionUC.execute({
      user_id: user.id,
    });
    return { lists };
  }

  @Get('inbox')
  async getInbox(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ) {
    const user = req.user;
    const data = await this.getInboxUC.execute({ user_id: user.id });
    return { data };
  }

  @Get(':listId')
  async getById(@Param('listId') listId: string) {
    const list = await this.getListByIdUC.execute(listId);
    return { message: 'Thành công', list };
  }

  @Patch(':listId')
  async update(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @Param('listId') listId: string,
    @Body() body: { name: string },
  ) {
    const user = req.user;
    const updated = await this.updateListUC.execute({
      id: listId,
      name: body.name,
      userId: user.id,
    });
    return { message: "Thành công trong chỉnh sửa", list: updated };
  }

  @Delete(':listId')
  async delete(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @Param('listId') listId: string,
  ) {
    const user = req.user;
    const list = await this.deleteListUC.execute({
      id: listId,
      userId: user.id,
    });
    return { message: 'Thành công', list };
  }

  @Patch(':listId/sortSection')
  async sortSection(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @Param('listId') listId: string,
    @Body() body: { fromId: string; toId: string },
  ) {
    const user = req.user;
    const updated = await this.sortSectionUC.execute({
      listId: listId,
      endSectionId: body.toId,
      startSectionId: body.fromId,
      userId: user.id,
    });
    return { message: 'Thành công trong chỉnh sửa', list: updated };
  }
}
