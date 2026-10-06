import { AppError, IListRepository, IUsecase } from "@/domain";
import { HttpMethod, PermissionMethodMap } from "@/domain/entities/permission.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";
export class CheckPermissionListUsecase implements IUsecase<boolean> {
    constructor(private readonly memberRepository: IMemberRepository, private readonly listRepository: IListRepository) { }
    async execute(user_id: string, list_id: string,PermissionMethodMap:PermissionMethodMap,method:HttpMethod): Promise<boolean> {
        try {
            if (!user_id || !list_id) {
                throw new AppError("NOT_FOUND", "khÃ´ng cÃ³ dá»¯ liá»‡u vui lÃ²ng thá»­ láº¡i", 404)
            }
            const [list, member] = await Promise.all([this.listRepository.findById(list_id), this.memberRepository.findOne({
                list: list_id,
                user: user_id,
                status:"accept"
            })])

            console.log(member?.role)
            if(list?.user===user_id || member?.role=="owner"){
                return true
            }

            if(!member || !list){
               return false
            }
            if (!PermissionMethodMap[member.role]?.some((i)=>i==method)) {
                if (list?.user !== user_id) {
                    return false
                }
            }
            
            return true
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
