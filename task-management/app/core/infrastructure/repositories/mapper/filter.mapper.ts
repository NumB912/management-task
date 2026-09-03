import { IFilter } from "@/app/core/domain";
import { IFilterDocument, IFilterDocumentPopulated } from "../database/interface";
import { TagMapper } from "./tag.mapper";
import { Types } from "mongoose";
import { IFilterWithId } from "@/app/core/domain/entities/filter.entities";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";
import { UserMapper } from "./user.mapper";

export class FilterMapper implements IMapper<IFilterDocument, IFilterWithId, IFilterDocumentPopulated, IFilter> {
  constructor(private readonly tagMapper: TagMapper, private readonly userMapper: UserMapper) { }

  toDomain(doc: IFilterDocument): IFilterWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc.user.toString(),
      tags: doc.tags ? doc.tags.map((tag) => tag.toString()) : [],
      start_date: doc.start_date,
      end_date: doc.end_date,
      description: doc.description,
      priority: doc.priority,
      specials: doc.specials,
      status: doc.status,
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
    if (doc.priority) partial.priority = doc.priority;
    if (doc.specials) partial.specials = doc.specials;
    if (doc.status) partial.status = doc.status;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IFilterDocumentPopulated): IFilter {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc.user.toString(),
      tags: doc.tags,
      start_date: doc.start_date,
      end_date: doc.end_date,
      description: doc.description,
      priority: doc.priority,
      specials: doc.specials,
      status: doc.status,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IFilterDocumentPopulated>): Partial<IFilter> {
    const partial: Partial<IFilter> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.user) partial.user = doc.user.toString();
    if (doc.tags) partial.tags = doc.tags;
    if (doc.start_date) partial.start_date = doc.start_date;
    if (doc.end_date) partial.end_date = doc.end_date;
    if (doc.description) partial.description = doc.description;
    if (doc.priority) partial.priority = doc.priority;
    if (doc.specials) partial.specials = doc.specials;
    if (doc.status) partial.status = doc.status;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IFilterDocument[]): IFilterWithId[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IFilterDocumentPopulated[]): IFilter[] {
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
    if (entity.id) update._id = new Types.ObjectId(entity.id);
    if (entity.name) update.name = entity.name;
    if (entity.tags!=undefined) {
      update.tags = entity.tags
    }
    if (entity.user) update.user = new Types.ObjectId(entity.user);
    if (entity.start_date!=undefined) update.start_date = entity.start_date;
    if (entity.end_date!=undefined) update.end_date = entity.end_date;
    if (entity.description!=undefined) update.description = entity.description;
    if (entity.priority) update.priority = entity.priority;
    if (entity.specials) update.specials = entity.specials;
    if (entity.status) update.status = entity.status;
    console.log(update)
    return update;
  }

  toPersistencePopulate(entity: IFilter): IFilterDocumentPopulated {
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
    } as IFilterDocumentPopulated;
  }

  toPersistencePartialPopulate(entity: Partial<IFilter>): Partial<IFilterDocumentPopulated> {
    const update: Partial<IFilterDocumentPopulated> = {};
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