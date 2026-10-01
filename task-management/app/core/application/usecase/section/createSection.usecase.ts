import { IUsecase, AppError, ISection, ISectionRepository, IListRepository, IPublisher } from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { ISectionWithId } from "@/app/core/domain/entities/section.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
export class CreateSectionUsecase implements IUsecase<ISectionWithId | null> {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly listRepository: IListRepository,
    private readonly MemberRepository:IMemberRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) { }

  async execute(
    createSectionDTO: {
      user_id: string,
      list_id: string,
      data: Pick<ISectionWithId, "name"|"id">,
    }
  ): Promise<ISectionWithId | null> {

    const { data, list_id, user_id } = createSectionDTO

    try {
      await this.unitWork.startTransaction()
      const session = this.unitWork.getSession();

      const list = await this.listRepository.findById(list_id,session)
      if(!list){
        throw new AppError("NOT_FOUND","Không tìm thấy danh sách",404)
      }

      const createdSection = await this.sectionRepository.create(
        {
          name: data.name,
          id: data.id,
          list: list_id,
          path: `/list-${list_id}`,
          order: Date.now(),
        },
        session,
      );
      await this.listRepository.pushSectionsIntoList({
        listId: list_id,
        sectionIds: [createdSection.id],
        session: session
      })

      if (list.isShareList) {
        const members =await this.MemberRepository.findManyByIds(list.members)
        const users = members.map((member)=>member.user).filter((user)=>user!=user_id)
        this.publisher.pub("section.exchange", "section.create", "direct", users.map((user)=>{
          return {
          data:{
            id:createdSection.id,
            name:createdSection.name,
            listId:list_id
          },
          user:user,
          event:"section-create",
        }
        }));
      }
      await this.unitWork.commitTransaction();
      return createdSection;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình tạo section",
        error.status ?? 500,
      );
    }
  }
}
