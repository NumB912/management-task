import {
  IUsecase,
  ISection,
  AppError,
  ISectionRepository,
  IListRepository,
  IPublisher,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { ISectionWithId } from "@/domain/entities/section.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class UpdateSectionUsecase implements IUsecase<
  Partial<ISectionWithId | null>
> {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(
    id: string,
    userId:string,
    data: Partial<Omit<ISectionWithId, "id">>,
  ): Promise<Partial<ISectionWithId | null>> {
    if (!id) {
      throw new AppError("NOT_FOUND", `KhÃ´ng tÃ¬m tháº¥y section`, 404);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const section = await this.sectionRepository.findById(id,session)

      if(!section){
         throw new AppError("NOT_FOUND", `KhÃ´ng tÃ¬m tháº¥y section`, 404);
      }

      const list = await this.ListRepository.findById(section?.list,session)

      if(!list){
         throw new AppError("NOT_FOUND", `KhÃ´ng tÃ¬m tháº¥y danh saÌch`, 404);
      }

      const updateSection = await this.sectionRepository.update(
        id,
        data,
        session,
      );


      if (list.isShareList) {
        const members = await this.MemberRepository.findManyByIds(list.members);
        const users = members
          .map((member) => member.user)
          .filter((user) => user != userId);
        await this.publisher.pub(
          "section.exchange",
          "section.delete",
          "direct",
          users.map((user) => {
            return {
              data: {
                ...data,
                id:id
              },
              user: user,
              event: "section-update",
            };
          }),
        );
      }


      await this.unitWork.commitTransaction();
      return updateSection;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi section",
        error.status ?? 500,
      );
    }
  }
}
