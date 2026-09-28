import {
  AppError,
  IUsecase,
  IUnitWork,
  IListRepository,
} from "@/app/core/domain";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class DeleteMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly listRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) { }
  async execute(deleteMemberDTO: {
    email: string,
    listId: string,
    userId: string
  }): Promise<void> {
    console.log(deleteMemberDTO)
    const { email, listId, userId } = deleteMemberDTO

    await this.unitWork.startTransaction();
    const session = await this.unitWork.getSession()
    try {
      if (!email || !userId || !listId) {
        throw new AppError("NOT_FOUND", "Không chứa dữ liệu phù hợp", 404);
      }
      const member = await this.memberRepository.findOne({
        list: listId,
        email: email
      })
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 400);
      }
      await this.memberRepository.delete(member.id, session)
      await this.listRepository.pullMembersOutOfList({
        memberIds: [member.id], listId: listId, session: session
      })
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
  }
}
