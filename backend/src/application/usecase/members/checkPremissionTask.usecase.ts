import { AppError, ITaskRepository, IUsecase } from "@/domain";
import { HttpMethod, PermissionMethodMap } from "@/domain/entities/permission.entity";
import { CheckPermissionListUsecase } from "./index";
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
                error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh kiá»ƒm tra quyá»n",
                error.status ?? 500,
            );
        }
    }
}
