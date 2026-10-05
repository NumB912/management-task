import { AppError, ITagRepository, IUsecase } from "@/domain";

export class CheckOwnerTagUsecase implements IUsecase<boolean> {
    constructor(private readonly tagRepository: ITagRepository) { }
    async execute(user_id: string, tag_id: string): Promise<boolean> {
        try {
            if (!user_id || !tag_id) {
                throw new AppError("NOT_FOUND", "khÃ´ng cÃ³ dá»¯ liá»‡u vui lÃ²ng thá»­ láº¡i", 404)
            }
            const tag = await this.tagRepository.findById(tag_id)
            if (!tag) {
                throw new AppError("NOT FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 404)
            }
            if (tag.user != user_id) {
                return false
            }
            return true
        } catch (error) {
            console.error(error)
            throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500)
        }
    }
}
