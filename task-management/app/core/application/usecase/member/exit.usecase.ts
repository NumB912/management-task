import {
  AppError,
  IUsecase,
  IUnitWork,
  IListRepository,
  IPublisher,
  IUserRepository,
} from "@/app/core/domain";
import { IRealtimeNotifier } from "@/app/core/domain/message";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

const EXIT_MEMBER_EVENT = "exit-member";
const EXIT_MEMBER_NOTIFICATION = "exit-member-notification";

interface ExitMemberDTO {
  email: string;
  listId: string;
  userId: string;
}

export class ExitMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly userRepository: IUserRepository,
    private readonly publisher: IPublisher,
    private readonly realtimeNotifier: IRealtimeNotifier,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: ExitMemberDTO): Promise<void> {
    const { email, listId, userId } = DTO;

    if (!email || !userId || !listId) {
      throw new AppError("BAD_REQUEST", "Không chứa dữ liệu phù hợp", 400);
    }

    let memberEmail: string;
    let listName: string;
    let recipientIds: string[] = [];
    let notificationIds:string[] = []
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const list = await this.listRepository.findById(listId, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404);
      }
      const member = await this.memberRepository.findOne(
        { list: listId, user: userId, status: "accept" },
        session,
      );
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 404);
      }
      if (member.role === "owner" || String((list as any).user) === String(userId)) {
        throw new AppError("FORBIDDEN", "Chủ danh sách không thể rời khỏi danh sách", 403);
      }

      memberEmail = member.email;
      listName = list.name;

      const others =
        (await this.memberRepository.findManyByIds(list.members ?? [])) ?? [];
      const ids = new Set(
        others.filter((m) => m.status === "accept").map((m) => String(m.user)),
      );
      notificationIds = [...ids]
      if ((list as any).user) ids.add(String((list as any).user));
      ids.delete(String(userId));
      recipientIds = [...ids];
      await this.memberRepository.delete(member.id, session);
      await this.listRepository.pullMembersOutOfList({
        memberIds: [member.id],
        listId,
        session,
      });

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình rời danh sách",
        error.status ?? 500,
      );
    }
    void this.notifyExit({
      listId,
      listName: listName!,
      userId,
      memberEmail: memberEmail!,
      recipientIds,
      notificationIds:notificationIds
    });
  }

  private async notifyExit(params: {
    listId: string;
    listName: string;
    userId: string;
    memberEmail: string;
    recipientIds: string[];
    notificationIds:string[];
  }): Promise<void> {
    const { listId,notificationIds, listName, userId, memberEmail, recipientIds } = params;

    try {
      const user = await this.userRepository.findById(userId);
      const actor = { id: String(userId), name: user?.name, avatar: user?.avatar };

      const tasks: Promise<unknown>[] = [];

      if (recipientIds.length > 0) {
        tasks.push(
          Promise.resolve(
            this.publisher.pub("memberExchange", "exit.member", "direct", {
              userIds: recipientIds,
              event: EXIT_MEMBER_EVENT,
              data: { listId, email: memberEmail },
            }),
          ),
        );
      }

      if(notificationIds.length > 0){
        tasks.push(          Promise.resolve(
            this.realtimeNotifier.push(recipientIds, EXIT_MEMBER_NOTIFICATION, {
              listId,
              listName,
              user: actor,
            }),
          ),)
      }

      const results = await Promise.allSettled(tasks);
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`[exit-member] task ${i} failed`, r.reason);
        }
      });
    } catch (err) {
      console.error("[exit-member] notify failed", err);
    }
  }
}