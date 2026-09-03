import {
  AppError,
  IUsecase,
  IUserRepository,
  IUnitWork,
  IListRepository,
} from "@/app/core/domain";
import { IMemberWithId, IRole } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class InviteMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly listRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) { }
  async execute(inviteMembersDTO: {
    data: string[],
    listId: string,
    role: IRole,
    userId: string
  }): Promise<void> {

    const findList = await this.listRepository.findOne({
      id: inviteMembersDTO.listId,
      user: inviteMembersDTO.userId,
    })
    if (!findList) {
      throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404)
    }
    if (inviteMembersDTO.data.includes(inviteMembersDTO.userId)) {
      throw new AppError("CONFLICT", "Người dùng là chủ nên không thể thực thi", 404)
    }

    try {
      const userIds = inviteMembersDTO.data
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession()
      const findUsers = await this.userRepository.findManyByIds(userIds, session)
      if (findUsers.length == 0) {
        throw new AppError("NOT FOUND", "Không tìm thấy dữ liệu", 404)
      }
      const userInMembers = await this.memberRepository.checkMembersIsExist(userIds, inviteMembersDTO.listId)
      const userNotInMembers = findUsers.filter(user => !userInMembers.includes(user.id)).map((user) => user.id)
      const inviteMembers = userNotInMembers.map((member) => {
        return {
          status: "pending",
          role: inviteMembersDTO.role,
          list: inviteMembersDTO.listId,
          user: member,
          expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        } as Partial<IMemberWithId>
      })
      await this.memberRepository.createMany(inviteMembers, session)
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
  }
}
