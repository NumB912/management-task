import {
  AppError,
  IListRepository,
  IPublisher,
  IUnitWork,
  IUsecase,
} from "@/app/core/domain";
import { IRole } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

const MEMBER_ROLE_EVENT = "change.role.member";
const ASSIGNABLE_ROLES: Set<IRole> = new Set(["can edit", "read only"]);

interface ChangeRoleDTO {
  email: string;
  role: IRole;
  listId: string;
  userId: string; 
}

export class ChangeRoleUsecase implements IUsecase<boolean> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: ChangeRoleDTO): Promise<boolean> {
    const { email, role, listId, userId } = DTO;
    if (!email) {
      throw new AppError("BAD_REQUEST", "Không tìm thấy email", 400);
    }
    if (!ASSIGNABLE_ROLES.has(role)) {
      throw new AppError("BAD_REQUEST", "Vai trò không hợp lệ", 400);
    }
    let updated: boolean;
    let targetUserId: string[];
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();

      const list = await this.listRepository.findById(listId, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404);
      }


      const member = await this.memberRepository.findOne(
        { email, list: listId},
        session,
      );
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 404);
      }
      if (member.role === "owner") {
        throw new AppError("FORBIDDEN", "Không thể đổi quyền của chủ danh sách", 403);
      }

      const members = await this.memberRepository.findManyByIds(list.members,session)
      const tempSet = new Set(members.map((member)=>member?.user?.toString()!))
      tempSet.delete(userId)
      targetUserId = [...tempSet]
      updated = await this.memberRepository.updateBy(
        { email, list: listId },
        { role },
        session,
      );

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình thay đổi vai trò",
        error.status ?? 500,
      );
    }

    try {
      await Promise.resolve(
        this.publisher.pub("memberExchange", "update.role.member", "direct", {
          userIds: targetUserId,
          event: MEMBER_ROLE_EVENT,
          data: { listId, email, role },
        }),
      );
    } catch (error) {
      console.error("Gửi realtime đổi quyền thất bại:", error);
    }

    return updated;
  }
}