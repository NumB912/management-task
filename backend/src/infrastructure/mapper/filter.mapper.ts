import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { UserMapper } from "./user.mapper.js";
import { IFilter, IFilterWithId, IPriority, ISpecials, IStatus } from "@/domain/entities/filter.entity.js";
import { IFilterDocument } from "../repositories/database/schema/filter.schema.js";
import { TagMapper } from "./tag.mapper.js";
import { Types } from "mongoose";
import { Injectable } from "@nestjs/common";
@Injectable()
export class FilterMapper implements IMapper<IFilterDocument, IFilterWithId, IFilterDocument, IFilter> {
  constructor() { }

  toDomain(doc: IFilterDocument): IFilterWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc.user.toString(),
      tags: doc.tags ? doc.tags.map((tag) => tag.toString()) : [],
      start_date: doc.start_date,
      end_date: doc.end_date,
      description: doc.description,
      priority: doc.priority as IPriority,
      specials: doc.specials as ISpecials,
      status: doc.status as IStatus,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IFilterDocument>): Partial<IFilterWithId> {
    const partial: Partial<IFilterWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.user) partial.user = doc.user.toString();
    if (doc.tags) partial.tags = doc.tags.map(tag => tag.toString());
    if (doc.start_date) partial.start_date = doc.start_date;
    if (doc.end_date) partial.end_date = doc.end_date;
    if (doc.description) partial.description = doc.description;
    if (doc.priority!==undefined) partial.priority = doc.priority as IPriority;
    if (doc.specials!==undefined) partial.specials = doc.specials as ISpecials;
    if (doc.status!==undefined) partial.status = doc.status as IStatus;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IFilterDocument): IFilter {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc.user.toString(),
      tags: doc.tags,
      start_date: doc.start_date,
      end_date: doc.end_date,
      description: doc.description,
      priority: doc.priority as IPriority,
      specials: doc.specials as ISpecials,
      status: doc.status as IStatus,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IFilterDocument>): Partial<IFilter> {
    const partial: Partial<IFilter> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.user) partial.user = doc.user.toString();
    if (doc.tags) partial.tags = doc.tags;
    if (doc.start_date) partial.start_date = doc.start_date;
    if (doc.end_date) partial.end_date = doc.end_date;
    if (doc.description) partial.description = doc.description;
    if (doc.priority) partial.priority = doc.priority as IPriority;
    if (doc.specials) partial.specials = doc.specials as ISpecials;
    if (doc.status) partial.status = doc.status as IStatus;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IFilterDocument[]): IFilterWithId[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IFilterDocument[]): IFilter[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IFilterWithId): IFilterDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      user: new Types.ObjectId(entity.user),
      tags: entity.tags ? entity.tags : [],
      start_date: entity.start_date,
      end_date: entity.end_date,
      description: entity.description,
      priority: entity.priority,
      specials: entity.specials,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IFilterDocument;
  }

  toPersistencePartial(entity: Partial<IFilterWithId>): Partial<IFilterDocument> {
    const update: Partial<IFilterDocument> = {};
    if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
    if (entity.name !== undefined) update.name = entity.name;
    if (entity.tags !== undefined) update.tags = entity.tags;
    if (entity.user !== undefined) update.user = new Types.ObjectId(entity.user);
    if (entity.start_date !== undefined) update.start_date = entity.start_date;
    if (entity.end_date !== undefined) update.end_date = entity.end_date;
    if (entity.description !== undefined) update.description = entity.description;
    if (entity.priority !== undefined) update.priority = entity.priority;
    if (entity.specials !== undefined) update.specials = entity.specials;
    if (entity.status !== undefined) update.status = entity.status;
    return update;
  }

  toPersistencePopulate(entity: IFilter): IFilterDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      user: new Types.ObjectId(entity.user),
      tags: entity.tags ? entity.tags : [],
      start_date: entity.start_date,
      end_date: entity.end_date,
      description: entity.description,
      priority: entity.priority,
      specials: entity.specials,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IFilterDocument;
  }

  toPersistencePartialPopulate(entity: Partial<IFilter>): Partial<IFilterDocument> {
    const update: Partial<IFilterDocument> = {};
    if (entity.id) update._id = new Types.ObjectId(entity.id);
    if (entity.name) update.name = entity.name;
    if (entity.tags) {
      update.tags = entity.tags
    }
    if (entity.user) update.user = new Types.ObjectId(entity.user);
    if (entity.start_date) update.start_date = entity.start_date;
    if (entity.end_date) update.end_date = entity.end_date;
    if (entity.description) update.description = entity.description;
    if (entity.priority) update.priority = entity.priority;
    if (entity.specials) update.specials = entity.specials;
    if (entity.status) update.status = entity.status;
    return update;
  }
}