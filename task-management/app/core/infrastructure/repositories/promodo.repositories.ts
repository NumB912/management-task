

import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { BaseRepository } from "./base.repositories";
import { IPromodo, IPromodoWithId } from "../../domain/entities/promodo.entities";
import { PromodoMapper } from "./mapper/promodo.mapper";
import { DatabaseModels } from "./database/clientSchema.database";
import { IPromodoDocument } from "./database/interface/promodo.document";
import { IPromodoRepository } from "../../domain/repositories/IPromodo.repository";
import { Types } from "mongoose";
@injectable()
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
    @inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @inject(TYPES.PromodoMapper)
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
