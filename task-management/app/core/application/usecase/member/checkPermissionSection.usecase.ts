import { AppError, ISectionRepository, IUsecase } from "@/app/core/domain";
import { HttpMethod, PermissionMethodMap } from "@/app/core/domain/entities/permission.entities";
import { CheckPermissionListUsecase } from "./checkPermissionList.usecase";
export class CheckPermissionSectionUsecase implements IUsecase<boolean> {
    constructor(private readonly sectionRepository: ISectionRepository, private readonly checkPermissionListUsecase: CheckPermissionListUsecase) { }
    async execute(user_id: string, section_id: string, PermissionMethodMap: PermissionMethodMap, method: HttpMethod): Promise<boolean> {
        try {

            const section = await this.sectionRepository.findById(section_id)
            if (!section) return false;

            const hasPermission = await this.checkPermissionListUsecase.execute(user_id, section.list, PermissionMethodMap, method)

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
