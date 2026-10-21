import {
  CreateTagUsecase,
  DeleteTagOnlyMeUsecase,
  DeleteTagWithShareUsecase,
  GetAllTagsUsecase,
  GetTagByIdUsecase,
  UpdateTagOnlyMeUsecase,
  UpdateTagUsecase,
} from '@/application';
import { TYPES } from '@/infrastructure/types/dependency.type';
import { NotifySharedTagChangeUsecase } from '@/application/usecase/tag/notifySharedTagChange.usecase';
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
  Put,
  Req,
} from '@nestjs/common';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly sharedTagChanges: NotifySharedTagChangeUsecase,
    @Inject(TYPES.CreateTagUsecase)
    private readonly createTagUC: CreateTagUsecase,
    @Inject(TYPES.UpdateTagOnlyMeUsecase)
    private readonly updateTagOnlyMeUC: UpdateTagOnlyMeUsecase,
    @Inject(TYPES.DeleteTagOnlyMeUsecase)
    private readonly deleteTagOnlyMeUC: DeleteTagOnlyMeUsecase,
    @Inject(TYPES.UpdateTagUsecase)
    private readonly updateTagWithShareUC: UpdateTagUsecase,
    @Inject(TYPES.DeleteTagWithShareUsecase)
    private readonly deleteTagWithShareUC: DeleteTagWithShareUsecase,
  ) {}


  @Post()
  @HttpCode(200)
  async create(
    @Req() req: AuthRequest,
    @Body() body: { name: string; id: string; color?: string },
  ) {
    const createTag = await this.createTagUC.execute({
      name: body.name,
      id: body.id,
      color: body.color,
      userId: req.user.id,
    });
    return { tag: createTag };
  }

  @Patch(':tagId/onlyMe')
  async updateOnlyMe(
    @Req() req: AuthRequest,
    @Param('tagId') tagId: string,
    @Body() body: { name?: string; color?: string },
  ) {
    const data = await this.updateTagOnlyMeUC.execute({
      id: tagId,
      name: body.name,
      color: body.color,
      userId: req.user.id,
    });
    return { message: 'Thành công trong chỉnh sửa', data };
  }

  @Delete(':tagId/onlyMe')
  async deleteOnlyMe(@Req() req: AuthRequest, @Param('tagId') tagId: string) {
    const data = await this.deleteTagOnlyMeUC.execute({
      id: tagId,
      userId: req.user.id,
    });
    return { message: 'Thành công', data };
  }

  @Patch(':tagId/withShare')
  async updateWithShare(
    @Req() req: AuthRequest,
    @Param('tagId') tagId: string,
    @Body() body: { name?: string; color?: string },
  ) {
    const data = await this.sharedTagChanges.execute({ userId: req.user.id, tagId, operation: 'update' }, () => this.updateTagWithShareUC.execute({
      id: tagId,
      name: body.name,
      color: body.color,
      userId: req.user.id,
    }));
    return { message: 'Thành công trong chỉnh sửa', data };
  }

  @Delete(':tagId/withShare')
  async deleteWithShare(
    @Req() req: AuthRequest,
    @Param('tagId') tagId: string,
  ) {
    const data = await this.sharedTagChanges.execute({ userId: req.user.id, tagId, operation: 'delete' }, () => this.deleteTagWithShareUC.execute({
      id: tagId,
      userId: req.user.id,
    }));
    return { message: 'Thành công', data };
  }
}
