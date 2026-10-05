import { AppError, IListRepository, IUsecase } from "@/domain";

export class CheckOwnerUsecase implements IUsecase<boolean> {
    constructor(private readonly listRepository: IListRepository) { }
    async execute(user_id: string, list_id: string): Promise<boolean> {
        try {
            if (!user_id || !list_id) {
                throw new AppError("NOT_FOUND", "khÃ´ng cÃ³ dá»¯ liá»‡u vui lÃ²ng thá»­ láº¡i", 404)
            }
            const list = await this.listRepository.findById(list_id)
            if (!list) {
                throw new AppError("NOT FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 404)
            }

            if (list.user != user_id) {
                return false
            }
            return true
        } catch (error) {
            console.error(error)
            throw new AppError("ERROR", "BaÌ£n khÃ´ng coÌ quyÃªÌ€n thÆ°Ì£c thi", 500)
        }
    }
}
