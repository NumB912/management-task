import { ClientSession, Model, QueryFilter } from "mongoose";
import { DomainFilter, DomainSelect, IRepository } from "../../domain/repositories/IRepositories";

export abstract class BaseRepository<TDocument, TEntity, ID = string> implements IRepository<TEntity, ID> {
  constructor(protected readonly model: Model<TDocument>) { }
  protected abstract toDomain(doc: TDocument): TEntity
  protected abstract toDomainPartial(doc: Partial<TDocument>): Partial<TEntity>
  protected abstract toPresistence(doc: Partial<TEntity>): Partial<TDocument>
  protected abstract toPresistencePartial(doc: Partial<TEntity>): Partial<TDocument>
  async findOne(filter: DomainFilter<TEntity>, session?: ClientSession): Promise<TEntity | null> {
    const doc = await this.model.findOne({ ...this.toPresistencePartial(filter), deleted_at: undefined }, null, { session });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async count(filter: Partial<TEntity>, session?: ClientSession): Promise<number> {
    const doc = await this.model.countDocuments({
      ...(this.toPresistence(filter) as QueryFilter<TDocument>)
    }, { session: session })
    return doc
  }

  async createMany(datas: Partial<TEntity>[], session?: ClientSession): Promise<TEntity[]> {
    const datasPersistence = datas.map((data) => this.toPresistence(data));
    const docs = await this.model.insertMany(datasPersistence, { session });
    return docs.map((doc) => this.toDomain(doc as TDocument));
  }

  async findManyByIds(ids: ID[]): Promise<TEntity[]> {
    const docs = await this.model
      .find({
        _id: { $in: ids },
        $and: [{
          deleted_at: null
        }]
      } as QueryFilter<TDocument>)
      .lean();

    return docs.map((doc) => this.toDomain(doc));
  }


  async softDelete(id: ID, session?: ClientSession): Promise<TEntity | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { $set: { deleted_at: new Date() } },
      { session, returnDocument: 'after' },
    );
    if (!result) {
      return null
    }
    return this.toDomain(result);
  }

  async create(data: Partial<TEntity>, session?: ClientSession): Promise<TEntity> {
    const [doc] = await this.model.create([this.toPresistence(data) as any], { session })
    return this.toDomain(doc);
  }

  async update(id: ID, data: Partial<TEntity>, session?: ClientSession): Promise<Partial<TEntity> | null> {
    console.log(this.toPresistencePartial(data))
    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: this.toPresistencePartial(data) },
      { session, returnDocument: 'after' }
    );
    return doc ? this.toDomainPartial(doc) : null;
  }
  async deleteBy(data: Partial<TEntity>, session?: ClientSession): Promise<boolean> {
    const result = await this.model.deleteOne(
      { ...data },
      { session }
    );
    return result.deletedCount > 0;
  }

  async updateBy(
    filter: Partial<TEntity>,
    data: Partial<TEntity>,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.model.updateMany(
      filter as DomainFilter<TDocument>,
      { $set: this.toPresistencePartial(data) },
      { session }
    );
    return result.modifiedCount > 0;
  }


  async delete(id: ID, session?: ClientSession): Promise<boolean> {
    const doc = await this.model.deleteOne({
      _id: id
    }, { session })
    return doc.deletedCount > 0
  }

  async softDeleteMany(data: Partial<TEntity>): Promise<boolean> {
    const filter = this.toPresistence(data);
    const doc = await this.model.updateMany(
      { ...filter, deleted_at: null },
      { $set: { deleted_at: new Date() } }
    );

    return doc.modifiedCount > 0;
  }

  async findById(id: ID, session?: ClientSession): Promise<TEntity | null> {
    const doc = await this.model.findOne({
      _id: id,
      deleted_at: null
    }).session(session ?? null);
    return doc ? this.toDomain(doc) : null;
  }

  async softDeleteManyByIds(ids: ID[], session?: ClientSession): Promise<boolean> {
    const docs = await this.model.updateMany({
      _id: {
        $id: ids
      }
    }, {
      session,
      returnDocument: 'after'
    })
    return docs.upsertedCount > 0
  }

  async findMany(DTO: {
    filter: DomainFilter<TEntity>, select?: DomainSelect<TEntity>, session?: ClientSession
  }): Promise<Partial<TEntity>[]> {
    const docs = await this.model.find({ ...(DTO.filter as QueryFilter<TDocument>), deleted_at: null }, null)
      .select(DTO.select as any ?? {})
      .session(DTO.session ?? null)
      .lean<TDocument[]>();
    return docs.map((d) => this.toDomainPartial(d));
  }

}