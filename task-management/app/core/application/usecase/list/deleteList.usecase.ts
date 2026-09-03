import { IUsecase, AppError, IListRepository, ITaskRepository, IRuleRepository, ISectionRepository } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { IListWithId } from "@/app/core/domain/entities/list.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

export class DeleteListUsecase implements IUsecase<IListWithId | null> {
  constructor(
    private readonly listRepository: IListRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly ruleRepository: IRuleRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(id: string): Promise<IListWithId | null> {

    if (!id) {
      throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
    }

    const listId = await this.listRepository.findById(id);
    if (!listId) {
      throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
    }
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const findList = await this.listRepository.findById(id,session)
      if(findList?.name=="Inbox"){
        throw new AppError("CAN_NOT_DEL","Không thể xóa list này",400)
      }

       await this.listRepository.delete(id, session);
      const pathList = `/list-${id}`
      await Promise.all([
        this.sectionRepository.deleteByPath(pathList, session),
        this.taskRepository.deleteByPath(pathList, session),
        this.ruleRepository.deleteByPath(pathList, session),
        this.memberRepository.deleteBy({list:id}, session)
      ]
      )

      await this.unitWork.commitTransaction()
      return listId
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình xóa list",
        error.status ?? 500,
      );
    }
  }
}
