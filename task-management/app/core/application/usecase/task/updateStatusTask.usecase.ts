import {
  IUsecase,
  AppError,
  ITask,
  ICaculateDeadLine,
  ITaskWithId,
  IRuleRepository,
  ITaskRepository,
  ISectionRepository,
  IRule,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
export class UpdateStatusUsecase implements IUsecase<Omit<
  ITaskWithId,
  "id"
> |ITask| null> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly calcService: ICaculateDeadLine,
    private readonly ruleRepository: IRuleRepository,
    private readonly sectionRepository:ISectionRepository,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    DTO: {
      taskId: string,
      data: Pick<ITask, "status">,
      userId: string
    }
  ): Promise<Omit<ITaskWithId, "id">|ITask | null> {

    const { data, taskId} = DTO
    if (!taskId || !data)
      throw new AppError("NOT_FOUND", "Không tìm thấy task", 404);

    const taskCur = await this.taskRepository.findByIdPopulate(taskId);
    if (!taskCur)
      throw new AppError("NOT_FOUND", "Không tìm thấy task để cập nhật", 404);
    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const repeat = taskCur.rule?.repeat;
      if (repeat?.mode !== undefined && repeat?.mode != "none") {
        const nextDay = this.calcService.getModeCaculateDeadLine(
          taskCur.rule!
        );

    if(nextDay && taskCur.rule?.end_date && nextDay.getTime() > taskCur.rule?.end_date?.getTime()!){
       const updateTask =  await this.taskRepository.update(
          taskId,
          {
            status: data.status,
            done_at: new Date(),
          },
          session,
        );
          await this.unitWork.commitTransaction()

          return updateTask as Omit<ITaskWithId, "id">;
        }

        const {rule} = taskCur as Pick<ITask,"rule">
        const ruleCreate = await this.ruleRepository.create({
          priority:rule?.priority,
          tags:rule?.tags,
          timer:rule?.timer,
          end_date:rule?.end_date,  
          repeat:rule?.repeat,
          path:rule?.path,  
          list: taskCur.list,
          task:null,  
          color:taskCur.rule?.color,
          start_date: nextDay
        }, session)

        await this.taskRepository.update(
          taskId,
          {
            status: data.status,
            done_at: new Date(),
          },
          session,
        );
         await this.ruleRepository.update(taskCur.rule?.id!,{
          repeat:{
            mode:"none",
            dates:[],
            days:[],
            every:undefined,
            specificDays:[]
          }
        },session)

        const taskCreated =  await this.taskRepository.create(
          {
            section: taskCur.section,
            name: taskCur.name,
            path: taskCur.path,
            rule: ruleCreate.id,
            description: taskCur.description,
            status: "pending",
            list: taskCur.list,
          },
          session,
        );
         await this.ruleRepository.update(ruleCreate.id,{
          task:taskCreated.id
        },session)

        await this.sectionRepository.pushTaskIntoSection(
          {
              id:taskCur.section,
              tasks: [taskCreated.id],
              session:session
          }
      );

        await this.unitWork.commitTransaction()
        return {
          ...taskCreated,
          rule: ruleCreate
        } as ITask ;
      }

      const update = await this.taskRepository.update(
        taskId,
        {
          status: data.status,
          done_at: new Date(),
        },
        session,
      );



      await this.unitWork.commitTransaction();
      return update as any;
    } catch (error: any) {
      console.error(error)
      await this.unitWork.rollBackTransaction();
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình cập nhật task",
        error.status ?? 500,
      );
    }
  }
}
