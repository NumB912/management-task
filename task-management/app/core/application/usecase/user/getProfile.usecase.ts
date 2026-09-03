import {
    IUsecase,
    IUserRepository,
    IUserWithouPassword,
} from "@/app/core/domain";

export class GetProfileUsecase implements IUsecase<IUserWithouPassword> {
    constructor(
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(DTO: { userId: string }): Promise<IUserWithouPassword> {
        try {

            const user = await this.userRepository.findById(DTO.userId)
            return {
                id: user?.id,
                created_at: user?.created_at,
                email: user?.email,
                name: user?.name,
                role: user?.role,
                avatar: user?.role,
                updated_at: user?.updated_at
            } as IUserWithouPassword

        } catch (error) {
            console.error("[ConfirmOtpUsecase] error:", error);
            throw error;
        }
    }
}
