import { IUsecase, AppError, ITagRepository, ITagWithId } from "@/domain";

export class CreateTagUsecase implements IUsecase<ITagWithId | null> {
  constructor(private readonly tagRepository: ITagRepository) {}
  async execute(DTO:{
    name:string,userId:string,id:string
  }): Promise<ITagWithId | null> {
    try {

      const {name,userId,id} = DTO
      const isExist = await this.tagRepository.findTagByName({ name:name,userId:userId });
      if (isExist) {
        throw new AppError("CONFLICT", "dÃ¹ng tÃªn khÃ¡c Ä‘i, trÃ¹ng tÃªn rá»“i.", 409);
      }
      

      const create = await this.tagRepository.create({
        name:name,
        user:userId,
        id:id
      });
      return create;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh táº¡o tag", 500);
    }
  }
}
