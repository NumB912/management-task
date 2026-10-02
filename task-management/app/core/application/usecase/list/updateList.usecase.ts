import {
  AppError,
  IListRepository,
  IListWithId,
  IPublisher,
  IUnitWork,
  IUsecase,
  IUserRepository,
} from "@/app/core/domain";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { RealtimeNotifier } from "../notification/notification.usecase";

const LIST_UPDATE_EVENT = "list-update";
const LIST_UPDATE_NOTIFICATION = "list-update-notification";

type ListUpdatePayload = Pick<IListWithId, "id" | "name">;

interface UpdateListDTO {
  id: string;
  name: string;
  userId: string;
}

export class UpdateListUsecase
  implements IUsecase<Partial<Omit<IListWithId, "id">> | null>
{
  constructor(
    private readonly listRepository: IListRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly realtimeNotifier: RealtimeNotifier,
    private readonly publisher: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: UpdateListDTO): Promise<Partial<Omit<IListWithId, "id">> | null> {
    const { id, name, userId } = DTO;
    if (!id) {
      throw new AppError("NOT_FOUND", "Không thấy dữ liệu", 404);
    }
    let list: IListWithId | null;
    let updated: Partial<Omit<IListWithId, "id">> | null;
    try {
      await this.unitWork.startTransaction();
      const session = this.unitWork.getSession();

      list = await this.listRepository.findById(id, session);
      if (!list) {
        throw new AppError("NOT_FOUND", "Không thấy list", 404);
      }

      updated = await this.listRepository.update(id, { name }, session);
      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình cập nhật list",
        error.status ?? 500,
      );
    }

    if (list.isShareList) {
      try {
        const user = await this.userRepository.findById(userId)
        await this.notifyMembers(list, { id: list.id, name }, userId,{
          avatar:user?.avatar,
          id:user?.id,
          name:user?.name
        });
      } catch (error) {
        console.error("Gửi thông báo cập nhật list thất bại:", error);
      }
    }

    return updated;
  }

  private async notifyMembers(
    list: IListWithId,
    payload: ListUpdatePayload,
    userId: string,
    actor?: {
      name?:string,
      id?:string,
      avatar?:string
    },
  ) {
    const members = (await this.memberRepository.findManyByIds(list.members)) ?? []
    const userIds = [
      ...new Set(
        members
          .filter((m) => m.status === "accept")
          .map((m) => m.user?.toString()!)
          .filter((uid) => uid !== userId && uid),
      ),
    ];
    if (userIds.length === 0) return;
    this.publisher.pub("list.exchange", "list.update", "direct", {
      event: LIST_UPDATE_EVENT,
      data: payload,
      userIds,
    });

    this.realtimeNotifier.push(userIds, LIST_UPDATE_NOTIFICATION, {
      listId: payload.id,
      listName: payload.name,
      oldListName: list.name,
      user: {
        id: actor?.id ?? userId,
        name: actor?.name,
        avatar: actor?.avatar,
      },
    });
  }
}