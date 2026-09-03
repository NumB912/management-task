import { AppError, IListRepository, IUsecase } from "@/app/core/domain";

export class CheckOwnerUsecase implements IUsecase<boolean> {
    constructor(private readonly listRepository: IListRepository) { }
    async execute(user_id: string, list_id: string): Promise<boolean> {
        try {
            if (!user_id || !list_id) {
                throw new AppError("NOT_FOUND", "không có dữ liệu vui lòng thử lại", 404)
            }
            const list = await this.listRepository.findById(list_id)
            if (!list) {
                throw new AppError("NOT FOUND", "Không tìm thấy dữ liệu", 404)
            }

            if (list.user != user_id) {
                return false
            }
            return true
        } catch (error) {
            console.error(error)
            throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500)
        }
    }
}
