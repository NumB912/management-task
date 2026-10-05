import {
  AppError,
  IUsecase,
  IUserRepository,
} from "@/domain";
import { IUserWithouPassword } from "@/domain/entities/user.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class SearchMemberUsecase implements IUsecase<Partial<IUserWithouPassword>[]> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository:IUserRepository
  ) {}
  async execute(searchMemberDTO:{listId:string,search:string}): Promise<Partial<IUserWithouPassword>[]> {
    try {
      if (!searchMemberDTO.listId || !searchMemberDTO.search || searchMemberDTO.search=="") {
        throw new AppError("NOT_FOUND", "Dá»¯ liá»‡u khÃ´ng tá»“n táº¡i", 400);
      }
      const members = await this.memberRepository.findMany({
          filter:{
            list:searchMemberDTO.listId,
          },
          select:{
            user:true,
          }
      })??[]
      
      const userIds = members
        .map((data) => data.user)
        .filter((user): user is string => typeof user === "string");
      const users = await this.userRepository.searchByEmailWithout(
        searchMemberDTO.search,
        userIds,
      );
      return users
    } catch (error: any) {
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh tÃ¬m kiáº¿m thÃ nh viÃªn",
        error.status ?? 500,
      );
    }
  }
}
