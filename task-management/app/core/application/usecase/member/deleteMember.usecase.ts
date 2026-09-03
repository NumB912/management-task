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
    memberId: string,
    listId: string,
    userId: string
  }): Promise<void> {

    const { memberId, listId, userId } = deleteMemberDTO

    await this.unitWork.startTransaction();
    const session = await this.unitWork.getSession()
    try {
      if (!memberId || !userId || listId) {
        throw new AppError("NOT_FOUND", "Khong chua du lieu phu hop", 404);
      }
      const member = await this.memberRepository.findOne({
        list: listId,
        id: memberId
      })
      if (!member) {
        throw new AppError("NOT_FOUND", "Khong tim thay thanh vien", 400);
      }
      await Promise.all([this.memberRepository.delete(memberId, session), this.listRepository.pullMembersOutOfList({
        memberIds: [memberId], listId: listId, session: session
      })])
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
