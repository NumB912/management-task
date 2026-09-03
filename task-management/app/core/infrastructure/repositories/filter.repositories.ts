

import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { IFilterRepository } from "../../domain";
import { BaseRepository } from "./base.repositories";
import { IFilterDocument } from "./database/interface";
import {  IFilterWithId } from "../../domain/entities/filter.entities";
import { FilterMapper } from "./mapper/filter.mapper";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class FilterRepository
  extends BaseRepository<IFilterDocument,IFilterWithId>
  implements IFilterRepository
{
  protected toDomain(doc: IFilterDocument): IFilterWithId {
    return this.filterMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IFilterDocument>): Partial<IFilterWithId> {
    return this.filterMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: IFilterWithId): Partial<IFilterDocument> {
    return this.filterMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<IFilterWithId>): Partial<IFilterDocument> {
    return this.filterMapper.toPersistencePartial(doc)
  }
  constructor(
    @inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @inject(TYPES.FilterMapper) 
    private readonly filterMapper:FilterMapper
  ) {
    super(db.Filter);
  }

}
