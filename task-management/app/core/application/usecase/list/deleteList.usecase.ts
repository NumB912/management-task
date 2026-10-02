import {
  IUsecase,
  AppError,
  IListRepository,
  ITaskRepository,
  IRuleRepository,
  ISectionRepository,
  IPublisher,
  IUserRepository,
} from "@/app/core/domain";
import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import { IListWithId } from "@/app/core/domain/entities/list.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { RealtimeNotifier } from "../notification/notification.usecase";

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
      throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
    }

    let list: IListWithId | null;
    let recipientIds: string[] = [];
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      list = await this.listRepository.findById(id, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không tìm thấy dữ liệu", 404);
      }

      if (list.name === "Inbox") {
        throw new AppError("CAN_NOT_DEL", "Không thể xóa list này", 400);
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
        error.message ?? "Lỗi trong quá trình xóa list",
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
        console.error("Gửi thông báo xóa list thất bại:", error);
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