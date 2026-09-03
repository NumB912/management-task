import {
  IUsecase,
  ITaskRepository,
  AppError,
  IRuleRepository,
  ISectionRepository,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ITaskWithId } from "@/app/core/domain/entities/task.entites";

export class DeleteTaskUsecase implements IUsecase<ITaskWithId | null> {
  constructor(
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly SectionRepository:ISectionRepository,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(id: string): Promise<ITaskWithId | null> {
    if (!id) {
      throw new AppError("NOT_FOUND", "Không tìm thấy task", 404);
    }
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const task = await this.TaskRepository.findById(id,session)
      if(!task){
        throw new AppError("NOT_FOUND","Không tìm thấy task",404)
      }
      const deleteTask = await this.TaskRepository.delete(id, session);
      if(!deleteTask){
        throw new AppError("NOT FOUND","Không tìm thấy dữ liệu",400)
      }
      await this.RuleRepository.deleteBy(
        {id:task.rule},
        session,
      );
      await this.SectionRepository.pullTaskFromSection({id:task.section,tasks:[id],session})
      await this.unitWork.commitTransaction();
      return task;
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo section",
        error.status ?? 500,
      );
    }
  }
}
