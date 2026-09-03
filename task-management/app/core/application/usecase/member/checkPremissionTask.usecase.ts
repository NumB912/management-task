import { AppError, ITaskRepository, IUsecase } from "@/app/core/domain";
import { HttpMethod, PermissionMethodMap } from "@/app/core/domain/entities/permission.entities";
import { CheckPermissionListUsecase } from "./checkPermissionList.usecase";
export class CheckPermissionTaskUsecase implements IUsecase<boolean> {
    constructor(private readonly taskRepository: ITaskRepository, private readonly checkPermissionListUsecase: CheckPermissionListUsecase) { }
    async execute(user_id: string, task_id: string, PermissionMethodMap: PermissionMethodMap, method: HttpMethod): Promise<boolean> {
        try {
            const task = await this.taskRepository.findById(task_id)
            if (!task) return false;
            const hasPermission = await this.checkPermissionListUsecase.execute(user_id, task.list, PermissionMethodMap, method)
            return hasPermission
        } catch (error: any) {
            console.error(error);
            throw new AppError(
                error.code ?? "INTERNAL_SERVER",
                error.message ?? "Lỗi trong quá trình kiểm tra quyền",
                error.status ?? 500,
            );
        }
    }
}
