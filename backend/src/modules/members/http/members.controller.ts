import {
  ChangeRoleUsecase,
  DeleteMemberUsecase,
  ExitMemberUsecase,
  InviteMemberUsecase,
  SearchMemberUsecase,
  StatusInviteUsecase,
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
  Query,
  Req,
} from '@nestjs/common';

type InviteStatus = Parameters<StatusInviteUsecase['execute']>[0]['status'];
type MemberRole = Parameters<ChangeRoleUsecase['execute']>[0]['role'];

@Controller('lists/:listId/members')
export class MembersController {
  constructor(
    @Inject(TYPES.InviteMemberUsecase)
    private readonly inviteMemberUC: InviteMemberUsecase,
    @Inject(TYPES.exitFromList)
    private readonly exitMemberUC: ExitMemberUsecase,
    @Inject(TYPES.StatusInviteUsecase)
    private readonly statusInviteUC: StatusInviteUsecase,
    @Inject(TYPES.SearchMemberUsecase)
    private readonly searchMemberUC: SearchMemberUsecase,
    @Inject(TYPES.DeleteMemberUsecase)
    private readonly deleteMemberUC: DeleteMemberUsecase,
    @Inject(TYPES.ChangeRoleUsecase)
    private readonly changeRoleUC: ChangeRoleUsecase,
  ) {}

  @Post()
  @HttpCode(200)
  async invite(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Body() body: { email: string[] },
  ) {
    await this.inviteMemberUC.execute({
      data: body.email,
      listId,
      userId: req.user.id,
    });
    return { message: 'Thành công', success: true };
  }

  @Delete('exit')
  async exit(@Req() req: AuthRequest, @Param('listId') listId: string) {
    await this.exitMemberUC.execute({
      listId,
      email: req.user.email,
      userId: req.user.id,
    });
    return { message: 'Thành công', success: true };
  }

  @Patch('inviteStatus')
  async inviteStatus(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Body() body: { status: InviteStatus },
  ) {


    console.log(body)
    const data = await this.statusInviteUC.execute({
      listId,
      email: req.user.email,
      status: body.status,
      userId: req.user.id,
    });
    return { message: 'Thành công', data };
  }

  @Get('searchMember')
  async search(
    @Param('listId') listId: string,
    @Query('search') search?: string,
  ) {
    const data = await this.searchMemberUC.execute({
      listId,
      search: search ?? '',
    });
    return { projects: { data } };
  }

  @Delete(':email')
  async delete(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Param('email') email: string,
  ) {
    await this.deleteMemberUC.execute({
      listId,
      email,
      userId: req.user.id,
    });
    return { message: 'Thành công', success: true };
  }

  @Patch(':email')
  async changeRole(
    @Req() req: AuthRequest,
    @Param('listId') listId: string,
    @Param('email') email: string,
    @Body() body: { role: MemberRole },
  ) {
    const data = await this.changeRoleUC.execute({
      listId,
      email,
      role: body.role,
      userId: req.user.id,
    });
    return { message: 'Thành công', data };
  }
}
