import { IUsecase, AppError, ITagRepository, ITagWithId } from "@/app/core/domain";

export class CreateTagUsecase implements IUsecase<ITagWithId | null> {
  constructor(private readonly tagRepository: ITagRepository) {}
  async execute(DTO:{
    name:string,userId:string
  }): Promise<ITagWithId | null> {
    try {

      const {name,userId} = DTO
      const isExist = await this.tagRepository.findTagByName({ name:name,userId:userId });
      if (isExist) {
        throw new AppError("CONFLICT", "dùng tên khác đi, trùng tên rồi.", 409);
      }
      const create = await this.tagRepository.create({
        name:name,
        user:userId
      });
      return create;
    } catch (error) {
      console.error(error);
      throw new AppError("ERROR", "Lỗi trong quá trình tạo tag", 500);
    }
  }
}
