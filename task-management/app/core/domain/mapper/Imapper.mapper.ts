export interface IMapper<TDocument, TEntity, TDocumentPopulate = TDocument, TEntityPopulate = TEntity, TEntityPartialPopulate = TEntityPopulate> {
  toDomain(doc: TDocument): TEntity;
  toDomainPartial(doc: Partial<TDocument>): Partial<TEntity>;
  toDomainPopulate(doc: TDocumentPopulate): TEntityPopulate;
  toDomainPartialPopulate(doc: Partial<TDocumentPopulate>): Partial<TEntityPartialPopulate>;
  toDomainList(docs: TDocument[]): TEntity[];
  toDomainPopulateList(docs: TDocumentPopulate[]): TEntityPopulate[];
  toPersistence(entity: TEntity): Partial<TDocument>;
  toPersistencePartial(entity: Partial<TEntity>): Partial<TDocument>;
  toPersistencePopulate(entity: TEntityPopulate): Partial<TDocumentPopulate>;
  toPersistencePartialPopulate(entity: Partial<TEntityPopulate>): Partial<TDocumentPopulate>;
}