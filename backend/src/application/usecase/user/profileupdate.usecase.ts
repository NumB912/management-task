import {
    AppError,
    IUnitWork,
    IUsecase,
    IUser,
    IUserRepository,
} from "@/domain";

export class PutProfileUsecase implements IUsecase<boolean> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly unitwork:IUnitWork
    ) { }

    async execute(DTO: { userId: string,data:Pick<IUser,"name"> }): Promise<boolean> {
        try {
            const {data,userId} = DTO
            await this.unitwork.startTransaction()
            const session = this.unitwork.getSession()

            if(!userId || !data){
                throw new AppError("NOT_FOUND","KhÃ´ng tÃ¬m tháº¥y Ä‘á»§ dá»¯ liá»‡u",404)
            }

            const user = await this.userRepository.findById(userId,session)

            if(!user){
                throw new AppError("NOT_FOUND","KhÃ´ng tÃ¬m tháº¥y Ä‘á»§ dá»¯ liá»‡u",404)
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
