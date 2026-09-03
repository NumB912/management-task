import { AppError, IHashService, IUnitWork, IUsecase, IUserRepository } from "@/app/core/domain";
import { InitListUsecase } from "../list";



export class RegisterEmailUsecase implements IUsecase<void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly initListUsecase:InitListUsecase,
    private readonly hashService: IHashService,
    private readonly unitWork: IUnitWork,
  ) {
  }

  async execute(registerForm: {
    password: string;
    name: string;
    email: string;
  }): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        email: registerForm.email
      });
      if (user) {
        throw new AppError("UNVALID", "Người dùng đã tồn tại vui lòng đăng nhập", 400);
      }
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const passwordHash = await this.hashService.hash(registerForm.password)
      const userCreate = await this.userRepository.create({
        password: passwordHash,
        email: registerForm.email,
        name: registerForm.name,
        role: "user"
      }, session)
       await this.initListUsecase.execute({
        data:{
          name:"Inbox",
          user:userCreate.id,
        },
        session:session
      })
      await this.unitWork.commitTransaction()
    } catch (error: any) {
      console.error(error);
      await this.unitWork.rollBackTransaction()
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình đăng ký",
        error.status ?? 500,
      );
    }
  }
}