import {
  IUsecase,
  AppError,
  IListRepository,
  ITaskRepository,
  IRuleRepository,
  ISectionRepository,
  IPublisher,
  IUserRepository,
} from "@/domain";
import { IUnitWork } from "@/domain/entities/unitwork.entity";
import { IListWithId } from "@/domain/entities/list.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";
import { RealtimeNotifier } from "../notifications/index";

const LIST_DELETE_EVENT = "list-delete";
const LIST_DELETE_NOTIFICATION = "list-delete-notification";
type ListDeletePayload = Pick<IListWithId, "id" | "name">;

interface DeleteListDTO {
  id: string;
  userId: string;
}

export class DeleteListUsecase implements IUsecase<IListWithId | null> {
  constructor(
    private readonly listRepository: IListRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly ruleRepository: IRuleRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository:IUserRepository,
    private readonly pushNotification: RealtimeNotifier,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: DeleteListDTO): Promise<IListWithId | null> {
    const { id, userId } = DTO;
    if (!id) {
      throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 404);
    }

    let list: IListWithId | null;
    let recipientIds: string[] = [];
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      list = await this.listRepository.findById(id, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u", 404);
      }

      if (list.name === "Inbox") {
        throw new AppError("CAN_NOT_DEL", "KhÃ´ng thá»ƒ xÃ³a list nÃ y", 400);
      }

      if (list.isShareList) {
        const members = (await this.memberRepository.findManyByIds(list.members)) ?? []
        members.filter((member)=>!member.user?.toString())
        recipientIds = [
          ...new Set(
            members
              .filter((m) => m.status === "accept")
              .map((m) => m.user?.toString()!)
              .filter((uid) => uid !== userId),
          ),
        ];
      }

      await this.listRepository.delete(id, session);

      const pathList = `/list-${id}`;
      await Promise.all([
        this.sectionRepository.deleteByPath(pathList, session),
        this.taskRepository.deleteByPath(pathList, session),
        this.ruleRepository.deleteByPath(pathList, session),
        this.memberRepository.deleteBy({ list: id }, session),
      ]);

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lá»—i trong quÃ¡ trÃ¬nh xÃ³a list",
        error.status ?? 500,
      );
    }
   if (recipientIds.length > 0) {
      try {
        const user = await this.userRepository.findById(userId)

        this.notifyMembers(
          { id: list.id, name: list.name },
          recipientIds,
          userId,
          {
            id:user?.id,
            name:user?.name,
            avatar:user?.avatar
          }
        );
      } catch (error) {
        console.error("Gá»­i thÃ´ng bÃ¡o xÃ³a list tháº¥t báº¡i:", error);
      }
    }

    return list;
  }

  private notifyMembers(
    payload: ListDeletePayload,
    userIds: string[],
    userId: string,
    actor?: {
      id?:string,
      name?:string,
      avatar?:string
    },
  ) {
    this.publisher.pub("list.exchange", "list.delete", "direct", {
      event: LIST_DELETE_EVENT,
      data: payload,
      userIds,
    });

    this.pushNotification.push(userIds, LIST_DELETE_NOTIFICATION, {
      listId: payload.id,
      listName: payload.name,
      user: {
        id: actor?.id ?? userId,
        name: actor?.name,
        avatar: actor?.avatar,
      },
    });
  }
}
