import { IUsecase, AppError, IFilterRepository, IFilterWithId, ITagRepository, IQueryFilterParserService, IColorRepository, IRuleRepository, IUnitWork, IColor, ITypeColor, IListRepository, ITaskRepository } from "@/domain";

export class UpdateColorUsecase implements IUsecase<void> {
  constructor(
    private readonly colorRepository: IColorRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly listRepository: IListRepository,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(DTO: {
    data: Pick<IColor, "color" | "type" | "refId">;
    userId: string;
  }): Promise<void> {
    const { data, userId } = DTO;
    if (!data || !data.color || !data.refId || !data.type) {
      throw new AppError("NOT_FOUND", "Không chứa dữ liệu cần thiết", 404);
    }

    await this.unitWork.startTransaction();
    const session = this.unitWork.getSession();

    try {
      await this.factoryColor({ ...data, userId }, session);
      await this.unitWork.commitTransaction();
    } catch (error) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      if (error instanceof AppError) throw error;
      throw new AppError("ERROR", "Lỗi trong quá trình cập nhật màu", 500);
    }
  }

  private async factoryColor(
    data: Pick<IColor, "color" | "refId" | "type"> & { userId: string },
    session?: unknown,
  ) {
    switch (data.type) {
      case "list":
        return this.handleColorList(data, session);
      case "task":
        return this.handleColorTask(data, session);
      default:
        throw new AppError("INVALID_TYPE", "Loại dữ liệu không hợp lệ", 400);
    }
  }

  private async handleColorList(
    data: Pick<IColor, "color" | "refId" | "type"> & { userId: string },
    session?: unknown,
  ) {
    const list = await this.listRepository.findById(data.refId, session);
    if (!list) {
      throw new AppError("NOT_FOUND", "Danh sách không tồn tại", 404);
    }
    if (!list.isShareList) {
      await this.listRepository.update(data.refId, { color: data.color }, session);
      return;
    }
    await this.upsertColor({
      ...data,
      path:`${list.id}`
    }, session);
  }

  private async handleColorTask(
    data: Pick<IColor, "color" | "refId" | "type"> & { userId: string },
    session?: unknown,
  ) {
    const rule = await this.taskRepository.findById(data.refId, session);
    if (!rule) {
      throw new AppError("NOT_FOUND", "task không tồn tại không tồn tại", 404);
    }
    await this.upsertColor({
      ...data,
      path:rule.path
    }, session);
  }

  private async upsertColor(
    data: Pick<IColor, "color" | "refId" | "type"|"path"> & { userId: string },
    session?: unknown,
  ) {
    const existing = await this.colorRepository.findOne(
      { user: data.userId, refId: data.refId, type: data.type },
      session,
    );

    if (existing) {
      await this.colorRepository.update(
        existing.id,
        { color: data.color },
        session,
      );
    } else {
      await this.colorRepository.create(
        {
          user: data.userId,
          refId: data.refId,
          type: data.type,
          color: data.color,
          path:data.path
        },
        session,
      );
    }
  }
}
