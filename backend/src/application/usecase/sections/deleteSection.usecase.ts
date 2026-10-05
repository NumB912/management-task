import {
  IUsecase,
  AppError,
  ISectionRepository,
  ITaskRepository,
  IRuleRepository,
  IListRepository,
  IPublisher,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { ISectionWithId } from "@/domain/entities/section.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class DeleteSectionUsecase implements IUsecase<ISectionWithId | null> {
  constructor(
    private readonly SectionRepository: ISectionRepository,
    private readonly TaskRepository: ITaskRepository,
    private readonly RuleRepository: IRuleRepository,
    private readonly ListRepository: IListRepository,
    private readonly MemberRepository: IMemberRepository,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}
  async execute(DeleteSectionDTO: {
    sectionId: string;
    userId: string;
  }): Promise<ISectionWithId | null> {
    const { sectionId, userId } = DeleteSectionDTO;
    if (!sectionId) {
      throw new AppError("INVALID_INPUT", "ID khÃ´ng há»£p lá»‡", 400);
    }
    const section = await this.SectionRepository.findById(sectionId);

    if (!section) {
      throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y section", 404);
    }
    const list = await this.ListRepository.findById(section.list);

    if (!list) {
      throw new AppError("NOT_FOUND", "list khÃ´ng tá»“n táº¡i", 404);
    }

    if (list.sections.length == 1) {
      throw new AppError("CAN_NOT_DELETE", "KhÃ´ng thá»ƒ xÃ³a section", 404);
    }

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const deleteSection = await this.SectionRepository.delete(
        sectionId,
        session,
      );
      if (!deleteSection) {
        throw new AppError("NOT_FOUND", "lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 404);
      }
      const pathSection = `${section?.path}/section-${sectionId}`;
      await this.RuleRepository.deleteByPath(pathSection, session);
      await this.TaskRepository.deleteByPath(pathSection, session);
      await this.ListRepository.pullSectionsOutOfList({
        listId: list.id,
        sectionIds: [sectionId],
        session: session,
      });

      if (list.isShareList) {
        const members = await this.MemberRepository.findManyByIds(list.members);
        const users = members
          .map((member) => member.user)
          .filter((user) => user != userId);
        this.publisher.pub(
          "section.exchange",
          "section.delete",
          "direct",
          users.map((user) => {
            return {
              data: {
                id: sectionId,
              },
              user: user,
              event: "section-delete",
            };
          }),
        );
      }

      await this.unitWork.commitTransaction();
      return section;
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh táº¡o section",
        error.status ?? 500,
      );
    }
  }
}
