import { AppError, ITagRepository, IUsecase } from "@/app/core/domain";

export class CheckOwnerTagUsecase implements IUsecase<boolean> {
    constructor(private readonly tagRepository: ITagRepository) { }
    async execute(user_id: string, tag_id: string): Promise<boolean> {
        try {
            if (!user_id || !tag_id) {
                throw new AppError("NOT_FOUND", "không có dữ liệu vui lòng thử lại", 404)
            }
            const tag = await this.tagRepository.findById(tag_id)
            if (!tag) {
                throw new AppError("NOT FOUND", "Không tìm thấy dữ liệu", 404)
            }
            if (tag.user != user_id) {
                return false
            }
            return true
        } catch (error) {
            console.error(error)
            throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500)
        }
    }
}
