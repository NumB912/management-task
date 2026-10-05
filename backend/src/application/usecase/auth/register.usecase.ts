import { IUsecase, AppError, ICredentialsService, IUnitWork, IUserRepository } from "@/domain";
import { InitListUsecase } from "../lists/index";



export class RegisterEmailUsecase implements IUsecase<void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly initListUsecase:InitListUsecase,
    private readonly CredentialsService: ICredentialsService,
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
        throw new AppError("UNVALID", "NgÆ°á»i dÃ¹ng Ä‘Ã£ tá»“n táº¡i vui lÃ²ng Ä‘Äƒng nháº­p", 400);
      }
      await this.unitWork.startTransaction()
      const session = await this.unitWork.getSession()
      const passwordHash = await this.CredentialsService.hash(registerForm.password)
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
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh Ä‘Äƒng kÃ½",
        error.status ?? 500,
      );
    }
  }
}
