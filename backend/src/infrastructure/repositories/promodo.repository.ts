


import { Inject, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { IPromodoDocument } from "./database/schema/promodo.schema.js";
import { IPromodo, IPromodoWithId } from "@/domain/entities/promodo.entity.js";
import { IPromodoRepository } from "@/domain/repositories/IPromodo.repository.js";
import { DatabaseModels } from "./database/clientSchema.database.js";
import { PromodoMapper } from "../mapper/promodo.mapper.js";
import { TYPES } from "../types/dependency.type.js";
import { BaseRepository } from "./base.repository.js";
@Injectable()
export class PromodoRepository
  extends BaseRepository<IPromodoDocument, IPromodoWithId>
  implements IPromodoRepository {
  protected toDomain(doc: IPromodoDocument): IPromodoWithId {
    return this.promodoMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IPromodoDocument>): Partial<IPromodoWithId> {
    return this.promodoMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<IPromodoWithId>): Partial<IPromodoDocument> {
    return this.promodoMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<IPromodoWithId>): Partial<IPromodoDocument> {
    return this.promodoMapper.toPersistencePartial(doc)
  }
  constructor(
    @Inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @Inject(TYPES.PromodoMapper)
    private readonly promodoMapper: PromodoMapper
  ) {
    super(db.Promodo);
  }
  async getPromodoDetail(userId: string): Promise<Partial<IPromodo>[]> {
    const docs = await this.db.Promodo.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "tasks",
        },
      },
      {
        $set: {
          task: { $first: "$tasks" },
        },
      },
      {
        $unset: "tasks",
      },
    ]);
    return docs.map((doc) => this.promodoMapper.toDomainPartialPopulate(doc));
  }
}
