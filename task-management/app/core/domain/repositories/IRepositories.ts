
export type DomainFilter<T> = Partial<{
  [K in keyof T]: T[K];
}>;

export type DomainSelect<T> = Partial<{
  [K in keyof T]:boolean
}>

export interface IRepository<TEntity, TId = string> {
  findById(id: TId,session?:unknown): Promise<TEntity | null>;
  findOne(filter: DomainFilter<TEntity>,session?:unknown): Promise<TEntity | null>;
  findMany(DTO?:{filter: DomainFilter<TEntity>,select?:DomainSelect<TEntity>,session?:unknown}): Promise<Partial<TEntity>[]>;
  findManyByIds(ids:TId[],session?:unknown):Promise<TEntity[]>
  create(data: Partial<TEntity>,session?:unknown): Promise<TEntity>;
  createMany(datas:Partial<TEntity>[],session?:unknown):Promise<TEntity[]>
  update(id: TId, data: Partial<TEntity>,session?:unknown): Promise<Partial<TEntity> | null>;
updateBy(
    filter: Partial<TEntity>,
    data: Partial<TEntity>,
    session?: unknown
  ): Promise<boolean> 
  delete(id: TId,session?:unknown): Promise<boolean>;
  deleteBy(data: Partial<TEntity>, session?: unknown): Promise<boolean>
  softDelete(id:TId,session?:unknown):Promise<TEntity|null>
  softDeleteMany(data: Partial<TEntity>,session?:unknown):Promise<boolean>
  softDeleteManyByIds(ids:TId[],session?:unknown):Promise<boolean>
  count(filter:Partial<TEntity>,session?:unknown):Promise<number>
}