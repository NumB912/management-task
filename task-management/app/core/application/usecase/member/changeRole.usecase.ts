import { AppError, IUnitWork, IUsecase } from "@/app/core/domain";
import { IMemberWithId, IRole } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class ChangeRoleUsecase implements IUsecase<Partial<boolean>> {
  constructor(private readonly memberRepository: IMemberRepository, private readonly unitWork: IUnitWork) { }
  async execute(ChangeRole:{email: string, role: IRole,listId:string}): Promise<boolean> {
    if (!ChangeRole.email) {
      throw new AppError("", "", 400);
    }
    await this.unitWork.startTransaction();
    try {
      const member = await this.memberRepository.findOne({
        email:ChangeRole.email,
        list:ChangeRole.listId,
        status:"accept"
      });
      if (!member) {
        throw new AppError("NOT_FOUND", "Không tìm thấy thành viên", 404);
      }

      const update = await this.memberRepository.updateBy({
        email:ChangeRole.email
      }, {
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
