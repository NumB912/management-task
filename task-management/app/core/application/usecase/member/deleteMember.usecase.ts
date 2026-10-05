import {
  AppError,
  IUsecase,
  IUnitWork,
  IListRepository,
  IUserRepository,
  IPublisher,
} from "@/app/core/domain";
import { IRealtimeNotifier } from "@/app/core/domain/message";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
const REMOVE_MEMBER_EVENT = "remove-member";
const REMOVE_MEMBER_OWN_EVENT = "remove-own-member";
const REMOVE_MEMBER_NOTIFICATION = "remove-member-notification";
export class DeleteMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly userRepository: IUserRepository,
    private readonly publisher: IPublisher,
    private readonly realtimeNotifier: IRealtimeNotifier,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(deleteMemberDTO: {
    email: string;   // người bị xóa / removed member's email
    listId: string;
    userId: string;  // người xóa / the user performing the removal
  }): Promise<void> {
    const { email, listId, userId } = deleteMemberDTO;

    let memberEmail = "";
    let listName = "";
    let removedUserId: string | undefined;
    let recipientIds: string[] = [];
    let notificationId:string[] = []
    await this.unitWork.startTransaction();
    const session = await this.unitWork.getSession();

    try {
      if (!email || !userId || !listId) {
        throw new AppError("NOT_FOUND", "Không chứa dữ liệu phù hợp", 404);
      }

      const list = await this.listRepository.findById(listId, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404);
      }

      const member = await this.memberRepository.findOne(
        { list: listId, email, status: "accept" },
        session,
      );
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 404);
      }
      if (member.role === "owner") {
        throw new AppError("FORBIDDEN", "Chủ danh sách không thể bị xóa khỏi danh sách", 403);
      }

      memberEmail = member.email ?? email;
      listName = (list as any).name ?? "";
      removedUserId = member.user ? String(member.user) : undefined;
      const others =
        (await this.memberRepository.findManyByIds(list.members ?? [], session)) ?? [];
      const ids = new Set(
        others.filter((m) => m.status === "accept").map((m) => String(m.user)),
      );
      if ((list as any).user) ids.add(String((list as any).user));
      notificationId = [...ids]
      ids.delete(String(userId));                
      if (removedUserId) ids.delete(removedUserId); 
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
        error.message ?? "Lỗi trong quá trình xóa thành viên",
        error.status ?? 500,
      );
    }

    void this.notifyRemoved({
      listId,
      listName,
      actorId: userId,
      memberEmail,
      removedUserId,
      recipientIds,
      notificationIds:notificationId
    });
  }

  private async notifyRemoved(params: {
    listId: string;
    listName: string;
    actorId: string;        
    memberEmail: string;    
    removedUserId?: string;
    notificationIds:string[]
    recipientIds: string[];
  }): Promise<void> {
    const { listId, listName, actorId, memberEmail,notificationIds, removedUserId, recipientIds } = params;

    try {
      const user = await this.userRepository.findById(actorId);
      const actor = { id: String(actorId), name: user?.name, avatar: user?.avatar };
      const tasks: Promise<unknown>[] = [];
      console.log(notificationIds)
      if (recipientIds.length > 0) {

        tasks.push(
          Promise.resolve(
            this.publisher.pub("memberExchange", "remove.member", "direct", {
              userIds: recipientIds,
              event: REMOVE_MEMBER_EVENT,
              data: { listId, email: memberEmail },
            }),
          )
        );
      }

      if(notificationIds.length > 0){
        tasks.push(Promise.resolve(
            this.realtimeNotifier.push(notificationIds, REMOVE_MEMBER_NOTIFICATION, {
              listId,
              listName,
              user: actor,                                  
              removedMember: { id: removedUserId, email: memberEmail }, 
            }),
          ))
      }

      if (removedUserId) {
        
        tasks.push(
          Promise.resolve(
            this.publisher.pub("memberExchange", "remove.own.member", "direct", {
              userIds: [removedUserId],
              event: REMOVE_MEMBER_OWN_EVENT,
              data: { listId, listName, removedBy: actor },
            }),
          ),
        );
      }

      const results = await Promise.allSettled(tasks);
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`[remove-member] task ${i} failed`, r.reason);
        }
      });
    } catch (err) {
      console.error("[remove-member] notify failed", err);
    }
  }
}
