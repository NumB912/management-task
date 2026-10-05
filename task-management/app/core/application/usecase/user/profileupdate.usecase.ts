import {
    AppError,
    IUnitWork,
    IUsecase,
    IUser,
    IUserRepository,
} from "@/app/core/domain";

export class PutProfileUsecase implements IUsecase<boolean> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly unitwork:IUnitWork
    ) { }

    async execute(DTO: { userId: string,data:Partial<Pick<IUser,"email"|"avatar">> }): Promise<boolean> {
        try {
            const {data,userId} = DTO
            await this.unitwork.startTransaction()
            const session = this.unitwork.getSession()

            if(!userId || !data){
                throw new AppError("NOT_FOUND","Không tìm thấy đủ dữ liệu",404)
            }

            const user = await this.userRepository.findById(userId,session)

            if(!user){
                throw new AppError("NOT_FOUND","Không tìm thấy đủ dữ liệu",404)
            }

            const updateUser = await this.userRepository.update(userId,{
                ...data
            })


            await this.unitwork.commitTransaction()
            return !updateUser
        } catch (error) {

            await this.unitwork.rollBackTransaction()
            console.error("[ConfirmOtpUsecase] error:", error);
            throw error;
        }
    }
}
