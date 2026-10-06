import {
  AppError,
  IUsecase,
  IUnitWork,
  IListRepository,
  IListWithId,
  IPublisher,
  IUserRepository,
} from "@/domain";
import { IRealtimeNotifier } from "@/domain/message";
import {
  IMemberWithId,
  IStatusMember,
} from "@/domain/entities/member.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";
import { SyncMemberTagsUseCase } from "../tag/index";
import { INotificationRepository } from "@/domain/repositories/INotification.repository";

interface IStatusMemberInviteInput {
  email: string;
  userId: string;
  status: IStatusMember;
  listId: string;
}

interface PublishContext {
  userIds: string[];
  member: Record<string, unknown>;
  actor: { id: string; name?: string; avatar?: string|null };
  email?: string;
  list: IListWithId;
}

const VALID_STATUSES: Set<IStatusMember> = new Set(["accept", "deny"]);

export class StatusInviteUsecase implements IUsecase<boolean> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly syncMemberTag: SyncMemberTagsUseCase,
    private readonly userRepository: IUserRepository,
    private readonly publisher: IPublisher,
    private readonly realtimeNotifier: IRealtimeNotifier,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(data: IStatusMemberInviteInput): Promise<boolean> {
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      this.validateInput(data);
      const { email, userId, status, listId } = data;

      const list = await this.listRepository.findById(listId, session);
      const member = await this.memberRepository.findOne(
        {
          list: listId,
          status: "pending",
          email: email,
        },
        session,
      );

      if (status == "deny" && (!member || !list)) {
        await this.notificationRepository.updateNotificationInviteMemberStatus(
          {
            listId: listId,
            userId: userId,
            status: "deny",
          },
          session,
        );
        await this.unitWork.commitTransaction();
        return true;
      }

      if (!list) {
        throw new AppError("NOT_FOUND", "Không tồn tại danh sách", 404);
      }

      this.validateMember({ member, userId });
      if (status === "accept") {
        await this.acceptInvite({
          list,
          memberId: member!.id,
          session,
          userId,
        });
      }

      const updated = await this.memberRepository.updateBy(
        {
          list: listId,
          email: email,
        },
        { status, updated_at: new Date(), expired_at: undefined },
        session,
      );

      await this.notificationRepository.updateNotificationInviteMemberStatus(
        {
          listId: listId,
          status: status,
          userId: userId,
        },
        session,
      );
      await this.unitWork.commitTransaction();
      await this.notifyMemberDecision({
        status,
        listId,
        userId,
        member: member!,
      });

      return updated;
    } catch (error: any) {
      console.log(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi khi cập nhật trạng thái lời mời",
        error.status ?? 500,
      );
    }
  }

  private async notifyMemberDecision(params: {
    status: IStatusMember;
    listId: string;
    userId: string;
    member: any;
  }): Promise<void> {
    const { status, listId, userId, member } = params;

    try {
      const [list, user] = await Promise.all([
        this.listRepository.findById(listId),
        this.userRepository.findById(userId),
      ]);
      if (!list || !user) return;

      const members = await this.memberRepository.findManyByIds(
        list.members ?? [],
      );
      const actorId = String(userId);

      const recipients = new Set(
        members.filter((m) => m.status === "accept").map((m) => String(m.user)),
      );
      if (list.user) recipients.add(list.user);
      recipients.delete(actorId);

      if (recipients.size === 0) return;

      const plain = member?.toObject?.() ?? member;

      const userIds = [...recipients];
      const actor = {
        id: actorId,
        name: user.name,
        avatar: user.avatar,
      };
      const payload = this.buildBasePublish(status, {
        userIds: [...new Set([...userIds])],
        member: plain,
        actor,
        email: user.email,
        list,
      });

    console.log("[notify] status =", status, "routingKey =", `${status}.member`);
      const results = await Promise.allSettled([
        this.publisher.pub(
          "memberExchange",
          `${status}.member`,
          "direct",
          payload,
        ),
        this.realtimeNotifier.push(userIds, `${status}-member-notification`, {
          listId: String(listId),
          listName: list.name,
          user: actor,
          status,
        }),
      ]);

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(
            `[${status}-member] ${i === 0 ? "publish data" : "notification"} failed`,
            r.reason,
          );
        }
      });
    } catch (err) {
      console.error(`[${status}-member] notify failed`, err);
    }
  }

  private validateInput(data: IStatusMemberInviteInput): void {
    const { email, userId, status } = data;
    if (!email || !userId || !status) {
      throw new AppError("BAD_REQUEST", "Thiếu thông tin cần thiết", 400);
    }
    if (!VALID_STATUSES.has(status)) {
      throw new AppError("BAD_REQUEST", "Trạng thái không hợp lệ", 400);
    }
  }

  private buildBasePublish(status: IStatusMember, ctx: PublishContext) {
    const { userIds, member, actor, email, list } = ctx;
    return {
      userIds,
      event: `${status}-member`,
      data: {
        member: {
          ...member,
          status,
          user: { ...actor, email },
        },
        listName: list.name,
        listId: String(list.id),
      },
    };
  }

  private validateMember(DTO: {
    member: Pick<
      IMemberWithId,
      "email" | "expired_at" | "status" | "user"
    > | null;
    userId: string;
  }): void {
    const { member, userId } = DTO;

    if (!member) {
      throw new AppError("NOT_FOUND", "Không tìm thấy lời mời", 404);
    }
    if (member.user?.toString() != userId?.toString()) {
      console.log(member.user, userId);
      throw new AppError(
        "FORBIDDEN",
        "Bạn không có quyền thay đổi lời mời này",
        403,
      );
    }
    if ((member.expired_at?.getTime() ?? Date.now()) <= Date.now()) {
      throw new AppError("TIME_OUT", "Hết hạn chấp nhận", 410);
    }
    if (member.status !== "pending") {
      throw new AppError("BAD_REQUEST", "Lời mời đã được xử lý", 400);
    }
  }

  private async acceptInvite(DTO: {
    userId: string;
    memberId: string;
    list: IListWithId;
    session?: unknown;
  }): Promise<void> {
    const { list, memberId, session, userId } = DTO;
    await this.listRepository.pushMembersIntoList({
      memberIds: [memberId],
      listId: list.id,
      session: session,
    });
    const tagsInList = await this.listRepository.findById(list.id, session);
    await this.syncMemberTag.execute({
      tags: tagsInList?.shared_tags?.map((shared_tag) => shared_tag.toString()) ?? [],
      userIds: [userId],
      session,
    });
    if (!list.isShareList) {
      await this.listRepository.update(list.id, { isShareList: true }, session);
    }
  }
}
