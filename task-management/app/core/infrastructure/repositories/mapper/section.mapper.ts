import { ISection, ISectionWithId } from "@/app/core/domain/entities/section.entities";
import { ISectionDocument, ISectionPopulateDocument, ITaskDocumentPopulate } from "../database/interface";
import { Types } from "mongoose";
import { TaskMapper } from "./task.mapper";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";

export class SectionMapper implements IMapper<ISectionDocument, ISectionWithId, ISectionPopulateDocument, ISection> {
  constructor(
    private readonly taskMapper: TaskMapper,
  ) { }

  toDomain(doc: ISectionDocument): ISectionWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      list: doc.list.toString(),
      tasks: doc.tasks.map(t => t.toString())??[],
      path: doc.path,
      order: doc.order,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<ISectionDocument>): Partial<ISectionWithId> {
    const partial: Partial<ISectionWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.list) partial.list = doc.list.toString();
    if (doc.tasks) partial.tasks = doc.tasks.map(t => t.toString());
    if (doc.path) partial.path = doc.path;
    if (doc.order) partial.order = doc.order;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: ISectionPopulateDocument): ISection {
    return {
      id: doc._id.toString(),
      name: doc.name,
      list: doc.list.toString(),
      tasks: doc.tasks.length>0 ? doc.tasks.map(t => this.taskMapper.toDomainPopulate(t)) : [],
      path: doc.path,
      order: doc.order,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<ISectionPopulateDocument>): Partial<ISection> {
    const partial: Partial<ISection> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.list) partial.list =doc.list.toString();
    if (doc.tasks) partial.tasks = doc.tasks.map(t => this.taskMapper.toDomainPopulate(t))??[];
    if (doc.path) partial.path = doc.path;
    if (doc.order) partial.order = doc.order;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: ISectionDocument[]): ISectionWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPopulateList(docs: ISectionPopulateDocument[]): ISection[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: ISectionWithId): ISectionDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      list: new Types.ObjectId(entity.list),
      tasks: entity.tasks ? entity.tasks.map(t => new Types.ObjectId(t)) : [],
      path: entity.path,
      order: entity.order,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as ISectionDocument;
  }

  toPersistencePartial(entity: Partial<ISectionWithId>): Partial<ISectionDocument> {
    const update: Partial<ISectionDocument> = {};
    if (entity.id) update._id = new Types.ObjectId(entity.id);
    if (entity.name) update.name = entity.name;
    if (entity.list) update.list = new Types.ObjectId(entity.list);
    if (entity.tasks) update.tasks = entity.tasks.map(t => new Types.ObjectId(t));
    if (entity.path) update.path = entity.path;
    if (entity.order!==undefined) update.order = entity.order;
    return update;
  }

  toPersistencePopulate(entity: ISection): Partial<ISectionPopulateDocument> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      list:new Types.ObjectId(entity.list),
      tasks: entity.tasks ? entity.tasks.map(t => this.taskMapper.toPersistencePopulate(t) as ITaskDocumentPopulate) : [],
      path: entity.path,
      order: entity.order,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    };
  }

  toPersistencePartialPopulate(entity: Partial<ISection>): Partial<ISectionPopulateDocument> {
    const update: Partial<ISectionPopulateDocument> = {};
    if (entity.name) update.name = entity.name;
    if (entity.list) update.list = new Types.ObjectId(entity.list)
    if (entity.tasks) update.tasks = entity.tasks.map(t => this.taskMapper.toPersistencePopulate(t) as ITaskDocumentPopulate);
    if (entity.path) update.path = entity.path;
    if (entity.order!==undefined) update.order = entity.order;
    return update;
  }
}