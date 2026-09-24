import {
  AppError,
  IUsecase,
  IUserRepository,
  IUnitWork,
  IListRepository,
  IPublisher,
} from "@/app/core/domain";
import { IMemberWithId } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { RealtimeNotifier } from "../notification/notification.usecase";

const INVITE_EXPIRES_DAYS = 7;
const APP_URL = process.env.APP_URL ?? "";

export class InviteMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly listRepository: IListRepository,
    private readonly notifier: RealtimeNotifier,
    private readonly pub: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(dto: {
    data: string[];
    listId: string;
    userId: string;
  }): Promise<void> {
    const userIds = [...new Set(dto.data)];
    const list = await this.listRepository.findOne({
      id: dto.listId,
      user: dto.userId,
    });
    if (!list) {
      throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404);
    }
    if (userIds.includes(dto.userId)) {
      throw new AppError("CONFLICT", "Không thể tự mời chính mình", 409);
    }
    if (userIds.length === 0) {
      throw new AppError("BAD_REQUEST", "Chưa chọn người dùng nào", 400);
    }
    const owner = await this.userRepository.findById(dto.userId);
    let created: IMemberWithId[] = [];
    let invitedUsers: { id: string; email: string; name: string }[] = [];

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const findUsers = await this.userRepository.findManyByIds(
        userIds,
        session,
      );
      if (findUsers.length === 0) {
        throw new AppError("NOT_FOUND", "Không tìm thấy người dùng", 404);
      }

      const existed = await this.memberRepository.checkMembersIsExist(
        userIds,
        dto.listId,
        session,
      );
      invitedUsers = findUsers.filter((u) => !existed.includes(u.id));

      if (invitedUsers.length === 0) {
        await this.unitWork.commitTransaction();
        return;
      }

      const expiredAt = new Date(
        Date.now() + INVITE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      );

      created = await this.memberRepository.createMany(
        invitedUsers.map<Partial<IMemberWithId>>((u) => ({
          status: "pending",
          list: dto.listId,
          role: "can edit",
          user: u.id,
          expired_at: expiredAt,
        })),
        session,
      );

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình mời thành viên",
        error.status ?? 500,
      );
    }
    const userById = new Map(invitedUsers.map((u) => [u.id, u]));
    const results = await Promise.allSettled(
      created.flatMap((member) => {
        const user = userById.get(String(member.user))!;

        return [
          this.pub.pub("exchange.invite.member", "member.invite", "direct", {
            email: user.email,
            name: user.name,
            ownerName: owner?.name ?? "Một người dùng",
            listName: list.name,
            inviteLink: `${APP_URL}/invite/${member.id}`,
          }),
          this.notifier.push([user.id], "member.invited", {
            listId: dto.listId,
            listName: list.name,
            ownerName: owner?.name ?? "Một người dùng",
            memberId: member.id,
          }),
        ];
      }),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(
        `Publish lỗi ${failed.length}/${results.length} lời mời cho list ${dto.listId}`,
        failed.map((f) => (f as PromiseRejectedResult).reason?.message),
      );
    }
  }
}
