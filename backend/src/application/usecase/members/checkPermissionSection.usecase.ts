import { AppError, ISectionRepository, IUsecase } from "@/domain";
import { HttpMethod, PermissionMethodMap } from "@/domain/entities/permission.entity";
import { CheckPermissionListUsecase } from "./index";
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
                error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh kiá»ƒm tra quyá»n",
                error.status ?? 500,
            );
        }
    }
}
