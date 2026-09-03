import { ITag } from "@/app/core/domain";
import { UserMapper } from "./user.mapper";
import { ITagDocument, ITagPopulateDocument } from "../database/interface";
import { Types } from "mongoose";
import { ITagWithId } from "@/app/core/domain/entities/tag.entities";
import { inject } from "tsyringe";
import { TYPES } from "../../container/type.container";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";

export class TagMapper implements IMapper<ITagDocument, ITagWithId, ITagPopulateDocument, ITag> {
  constructor(@inject(TYPES.UserMapper) private readonly userMapper: UserMapper) { }

  toDomain(doc: ITagDocument): ITagWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc?.user?.toString(),
      list: doc?.list?.toString(),
      isShareTag: doc.isShareTag,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<ITagDocument>): Partial<ITagWithId> {
    const data: Partial<ITagWithId> = {};
    if (doc._id) data.id = doc._id.toString();
    if (doc.name) data.name = doc.name;
    if (doc.user) data.user = doc.user.toString();
    if (doc.list) data.list = doc.list.toString();
    if (doc.created_at) data.created_at = doc.created_at;
    if (doc.updated_at) data.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) data.deleted_at = doc.deleted_at ?? undefined;
    if (doc.isShareTag) data.isShareTag = doc.isShareTag
    return data;
  }

  toDomainPopulate(doc: ITagPopulateDocument): ITag {
    return {
      id: doc._id.toString(),
      name: doc.name,
      isShareTag:doc.isShareTag,
      list: doc.list?.toString(),
      user: doc.user ? this.userMapper.toDomainWithoutPassword(doc.user) : undefined,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<ITagPopulateDocument>): Partial<ITag> {
    const data: Partial<ITag> = {};
    if (doc._id ) data.id = doc._id.toString();
    if (doc.isShareTag) data.isShareTag = doc.isShareTag
    if (doc.name ) data.name = doc.name;
    if (doc.user ) data.user = this.userMapper.toDomainWithoutPassword(doc.user);
    if (doc.list ) data.list =  doc.list.toString()
    if (doc.created_at ) data.created_at = doc.created_at;
    if (doc.updated_at ) data.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at ) data.deleted_at = doc.deleted_at ?? undefined;
    return data;
  }

  toDomainList(docs: ITagDocument[]): ITagWithId[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: ITagPopulateDocument[]): ITag[] {
    return docs.map((doc) => this.toDomainPopulate(doc));
  }

  toPersistence(entity: ITagWithId): ITagDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      isShareTag: entity.isShareTag,
      list: entity.list ? new Types.ObjectId(entity.list) : undefined,
      user: entity.user ? new Types.ObjectId(entity.user) : undefined,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
      order: 0,
    };
  }

  toPersistencePartial(entity: Partial<ITagWithId>): Partial<ITagDocument> {
    const update: Partial<ITagDocument> = {};
    if (entity.id ) update._id = new Types.ObjectId(entity.id);
    if (entity.name ) update.name = entity.name;
    if (entity.user ) update.user = new Types.ObjectId(entity.user)
    if (entity.list ) update.list = new Types.ObjectId(entity.list)
    if (entity.isShareTag) update.isShareTag = entity.isShareTag
    if (entity.created_at) update.created_at = entity.created_at
    if (entity.updated_at) update.updated_at = entity.updated_at
    if (entity.deleted_at) update.deleted_at = entity.deleted_at
    return update;
  }

  toPersistencePopulate(entity: ITag): ITagPopulateDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      list:entity.list?new Types.ObjectId(entity.list):undefined,
      isShareTag:entity.isShareTag,
      user: entity.user?this.userMapper.toPersistenceWithoutPassword(entity.user):undefined,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
      order: 0,
    };
  }

  toPersistencePartialPopulate(entity: Partial<ITag>): Partial<ITagPopulateDocument> {
    const update: Partial<ITagPopulateDocument> = {};
    if (entity.name ) update.name = entity.name;
    return update;
  }
}