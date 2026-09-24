import {
  Ipriority,
  ISpecials,
  IStatus,
  ITask,
  ITaskRepository,
} from "@/app/core/domain";
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { ClientSession, Types } from "mongoose";
import { TaskMapper } from "./mapper/task.mapper";
import { ITaskDocument, ITaskDocumentPopulate } from "./database/interface";
import { ITaskPartial, ITaskWithId } from "../../domain/entities/task.entites";
import { BaseRepository } from "./base.repositories";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class TaskRepository
  extends BaseRepository<ITaskDocument, ITaskWithId>
  implements ITaskRepository
{
  protected toDomain(doc: ITaskDocument): ITaskWithId {
    return this.TaskMapper.toDomain(doc);
  }
  protected toDomainPartial(doc: Partial<ITaskDocument>): Partial<ITaskWithId> {
    return this.TaskMapper.toDomainPartial(doc);
  }
  protected toPresistence(doc: Partial<ITaskWithId>): Partial<ITaskDocument> {
    return this.TaskMapper.toPersistencePartial(doc);
  }
  protected toPresistencePartial(
    doc: Partial<ITaskWithId>,
  ): Partial<ITaskDocument> {
    return this.TaskMapper.toPersistencePartial(doc);
  }

  constructor(
    @inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
    @inject(TYPES.TaskMapper) private readonly TaskMapper: TaskMapper,
  ) {
    super(db.Task);
  }
  async deleteByPath(path: string, session?: ClientSession): Promise<boolean> {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const doc = await this.db.Task.deleteMany({
      path: { $regex: `^${escapedPath}(/|$)` },
    }).session(session ?? null);
    return doc.deletedCount > 0;
  }
  async updateTaskId(
    id: string,
    data: Partial<ITaskWithId>,
    session?: ClientSession,
  ): Promise<ITaskWithId | null> {
    const update = await this.db.Task.findByIdAndUpdate(
      id,
      this.TaskMapper.toPersistencePartial(data),
      { session, new: true },
    );
    return update ? this.TaskMapper.toDomain(update) : null;
  }

  async findByIdPopulate(id: string): Promise<ITask | null> {
    const task = (await this.db.Task.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: null,
    }).populate("rule")) as unknown as ITaskDocumentPopulate;

    return this.TaskMapper.toDomainPopulate(task);
  }


  async findTasksByTagForUser(DTO: {
    tagName: string;
    userId: string;
    session?: ClientSession;
  }): Promise<Partial<ITaskPartial>[]> {
    const { tagName, userId, session } = DTO;

    const docs = await this.db.Task.aggregate([
      {
        $lookup: {
          from: "rules",
          foreignField: "_id",
          localField: "rule",
          as: "ruleData",
          pipeline: [
            {
              $match: { tags: tagName },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "lists",
          foreignField: "_id",
          localField: "list",
          as: "listData",
          pipeline: [
            {
              $lookup: {
                from: "members",
                foreignField: "_id",
                localField: "members",
                as: "memberData",
                pipeline: [
                  {
                    $match: { user: new Types.ObjectId(userId) },
                  },
                ],
              },
            },
            {
              $match: { "memberData.0": { $exists: true } },
            },
            {
              $unset: ["memberData"],
            },
            {
              $project: {
                _id: true,
                isShareList: true,
                name: true,
              },
            },
          ],
        },
      },
      {
        $match: {
          "listData.0": { $exists: true },
          "ruleData.0": { $exists: true },
        },
      },
      {
        $set: {
          rule: { $arrayElemAt: ["$ruleData", 0] },
        },
      },
      {
        $unset: ["listData", "ruleData"],
      },
    ])
      .session(session ?? null)
      .collation({ locale: "vi", strength: 2 });

    return docs.map((doc) => this.TaskMapper.toDomainPartialPopulate(doc));
  }

  async findTasksByFilter(DTO: {
    filter: {
      tagNames?: string[];
      priority?: Ipriority;
      specials?: ISpecials;
      status?: IStatus;
      startDate?: Date;
      endDate?: Date;
    };
    userId: string;
    session?: ClientSession;
  }): Promise<Partial<ITaskPartial>[]> {
    const { filter, userId, session } = DTO;
    const ruleMatch: Record<string, any> = {};
    const taskMatch: Record<string, any> = {};
    if (Array.isArray(filter.tagNames) && filter.tagNames.length > 0) {
      ruleMatch.tags = { $all: filter.tagNames };
    }

    if (filter.priority) {
      ruleMatch.priority = filter.priority;
    }

    if (filter.status) {
      taskMatch.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      const dateFilter: Record<string, any> = {};

      if (filter.startDate && !isNaN(new Date(filter.startDate).getTime())) {
        dateFilter.$gte = new Date(filter.startDate);
      }

      if (filter.endDate && !isNaN(new Date(filter.endDate).getTime())) {
        dateFilter.$lte = new Date(filter.endDate);
      }

      if (Object.keys(dateFilter).length > 0) {
        ruleMatch.start_date = dateFilter;
      }
    }

    if (filter.specials) {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      switch (filter.specials) {
        case "today":
          ruleMatch.start_date = {
            $gte: startOfToday,
            $lte: startOfTomorrow,
          };
          break;

        case "next 7 days": {
          const next7 = new Date(startOfToday);
          next7.setDate(next7.getDate() + 7);
          ruleMatch.start_date = {
            $gte: startOfToday,
            $lt: next7,
          };
          break;
        }

        case "overdue":
          ruleMatch.start_date = { $lt: startOfToday };
          taskMatch.status = { $ne: "done" };
          break;
        default:
          break;
      }
    }

    const docs = await this.db.Task.aggregate([
      {
        $lookup: {
          from: "rules",
          foreignField: "_id",
          localField: "rule",
          as: "ruleData",
          pipeline: [
            {
              $match: ruleMatch,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "lists",
          foreignField: "_id",
          localField: "list",
          as: "listData",
          pipeline: [
            {
              $lookup: {
                from: "members",
                foreignField: "_id",
                localField: "members",
                as: "memberData",
                pipeline: [
                  {
                    $match: { user: new Types.ObjectId(userId) },
                  },
                ],
              },
            },
            {
              $match: { "memberData.0": { $exists: true } },
            },
            {
              $unset: ["memberData"],
            },
            {
              $project: {
                _id: true,
                isShareList: true,
                name: true,
              },
            },
          ],
        },
      },
      {
        $match: {
          "listData.0": { $exists: true },
          "ruleData.0": { $exists: true },
          ...taskMatch,
        },
      },
      {
        $set: {
          rule: { $arrayElemAt: ["$ruleData", 0] },
        },
      },
      {
        $unset: ["listData", "ruleData"],
      },
    ])
      .session(session ?? null)
      .collation({ locale: "vi", strength: 2 });
    return docs.map((doc) => this.TaskMapper.toDomainPartialPopulate(doc));
  }
  private async getAccessibleMemberIds(
    userId: string,
    session?: ClientSession,
  ): Promise<Types.ObjectId[]> {
    return (
      await this.db.Member.find({ user: userId })
        .session(session ?? null)
        .select("_id")
        .lean()
    ).map((m) => m._id);
  }

  private buildTaskDateQuery(
    userObjectId: Types.ObjectId,
    member: Types.ObjectId[],
    ruleDateMatch: Record<string, any>,
  ) {
    return [
      {
        $lookup: {
          from: "rules",
          localField: "rule",
          foreignField: "_id",
          as: "ruleData",
          pipeline: [{ $match: ruleDateMatch }],
        },
      },
      { $match: { "ruleData.0": { $exists: true }, deleted_at: null } },
      {
        $lookup: {
          from: "lists",
          localField: "list",
          foreignField: "_id",
          as: "listData",
          pipeline: [
            {
              $match: {
                deleted_at: null,
                $or: [{ user: userObjectId }, { members: { $in: member } }],
              },
            },
          ],
        },
      },
      { $match: { "listData.0": { $exists: true } } },
      {
        $addFields: {
          rule: { $arrayElemAt: ["$ruleData", 0] },
        },
      },
      { $project: { listData: 0, ruleData: 0 } },
    ];
  }
  async upComming(
    userId: string,
    session?: ClientSession,
  ): Promise<Partial<ITaskPartial>[]> {
    const member = await this.getAccessibleMemberIds(userId, session);
    const userObjectId = new Types.ObjectId(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end7Days = new Date();
    end7Days.setDate(today.getDate() + 7);
    end7Days.setHours(59, 59, 59, 999);
    const docs = await this.db.Task.aggregate([
      ...this.buildTaskDateQuery(userObjectId, member, {
        start_date: { $gte: today, $lte: end7Days },
      }),
      { $match: { status: "pending" } },
      { $sort: { start_date: 1 } },
    ]).session(session ?? null);

    return docs.map((doc) => this.TaskMapper.toDomainPartialPopulate(doc));
  }

  async getToday(
    userId: string,
    session?: ClientSession,
  ): Promise<Partial<ITaskPartial>[]> {
    const member = await this.getAccessibleMemberIds(userId, session);
    const userObjectId = new Types.ObjectId(userId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    const docs = await this.db.Task.aggregate(
      this.buildTaskDateQuery(userObjectId, member, {
        start_date: { $gte: todayStart, $lte: todayEnd },
      }),
    ).session(session ?? null);
    return docs.map((doc) => this.TaskMapper.toDomainPartialPopulate(doc));
  }

  async getOverdue(
    userId: string,
    session?: ClientSession,
  ): Promise<Partial<ITaskPartial>[]> {
    const member = await this.getAccessibleMemberIds(userId, session);
    const userObjectId = new Types.ObjectId(userId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const docs = await this.db.Task.aggregate([
      ...this.buildTaskDateQuery(userObjectId, member, {
        start_date: { $lt: todayStart },
      }),
      { $match: { status: "pending" } },
    ]).session(session ?? null);

    return docs.map((doc) => this.TaskMapper.toDomainPartialPopulate(doc));
  }
}
