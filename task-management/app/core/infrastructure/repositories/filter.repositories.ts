

import { Inject, Injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { IFilterRepository } from "../../domain";
import { BaseRepository } from "./base.repositories";
import { IIFilterDocument } from "./database/interface";
import {  IFilterWithId } from "../../domain/entities/filter.entities";
import { FilterMapper } from "./mapper/filter.mapper";
import { DatabaseModels } from "./database/clientSchema.database";
import { ClientSession } from "mongoose";
@Injectable()
export class FilterRepository
  extends BaseRepository<IIFilterDocument,IFilterWithId>
  implements IFilterRepository
{
  protected toDomain(doc: IIFilterDocument): IFilterWithId {
    return this.filterMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IIFilterDocument>): Partial<IFilterWithId> {
    return this.filterMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: IFilterWithId): Partial<IIFilterDocument> {
    return this.filterMapper.toPersistence(doc)
  }
  protected toPresistencePartial(doc: Partial<IFilterWithId>): Partial<IIFilterDocument> {
    return this.filterMapper.toPersistencePartial(doc)
  }
  constructor(
    @Inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @Inject(TYPES.FilterMapper) 
    private readonly filterMapper:FilterMapper
  ) {
    super(db.Filter);
  }

async changeNameTag(DTO: {
  userId: string;
  currentName: string;
  newName: string;
  session?: ClientSession;
}) {
  const { userId, currentName, newName, session } = DTO;
  if (currentName === newName) return 0;
const result = await this.db.Filter.updateMany(
  { user: userId, tags: currentName },
  [
    {
      $set: {
        tags: {
          $concatArrays: [
            {
              $filter: {
                input: "$tags",
                as: "t",
                cond: {
                  $and: [
                    { $ne: ["$$t", currentName] },
                    { $ne: ["$$t", newName] },
                  ],
                },
              },
            },
            [newName],
          ],
        },
      },
    },
  ],
  { session, updatePipeline: true }, 
);

  return result.modifiedCount;
}

}
