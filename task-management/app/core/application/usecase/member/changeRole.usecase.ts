import { AppError, IUnitWork, IUsecase } from "@/app/core/domain";
import { IMemberWithId, IRole } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class ChangeRoleUsecase implements IUsecase<Partial<IMemberWithId> | null> {
  constructor(private readonly memberRepository: IMemberRepository, private readonly unitWork: IUnitWork) { }
  async execute(ChangeRole:{memberId: string, role: IRole,listId:string}): Promise<Partial<IMemberWithId> | null> {
    if (!ChangeRole.memberId) {
      throw new AppError("", "", 400);
    }
    await this.unitWork.startTransaction();
    try {
      const member = await this.memberRepository.findOne({
        id:ChangeRole.memberId,
        list:ChangeRole.listId,
        status:"accept"
      });
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 404);
      }

      const update = await this.memberRepository.update(ChangeRole.memberId, {
        role: ChangeRole.role,
      });
      
      await this.unitWork.commitTransaction();
      return update;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình thay đổi vai trò",
        error.status ?? 500,
      );
    }
  }
}
