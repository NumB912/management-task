import {
  IUsecase,
  ISection,
  AppError,
  ISectionRepository,
  IListRepository,
  IPublisher,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";

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
      throw new AppError("NOT_FOUND", `Không tìm thấy section`, 404);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const section = await this.sectionRepository.findById(id,session)

      if(!section){
         throw new AppError("NOT_FOUND", `Không tìm thấy section`, 404);
      }

      const list = await this.ListRepository.findById(section?.list,session)

      if(!list){
         throw new AppError("NOT_FOUND", `Không tìm thấy danh sách`, 404);
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
        error.message ?? "Lỗi trong quá trình thực thi section",
        error.status ?? 500,
      );
    }
  }
}
