import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { ITagDocument, ITagPopulateDocument } from "../repositories/database/schema/tag.schema.js";
import { ITag, ITagWithId } from "@/domain/entities/tag.entity.js";
import { UserMapper } from "./user.mapper.js";
import { Types } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { TYPES } from "../types/dependency.type.js";


@Injectable()
export class TagMapper implements IMapper<ITagDocument, ITagWithId,ITagPopulateDocument,ITag> {
  constructor(
    @Inject(TYPES.UserMapper)
    private readonly userMapper: UserMapper) { }
  toDomain(doc: ITagDocument): ITagWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      user: doc?.user?.toString(),
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
      user: this.userMapper.toDomainWithoutPassword(
        doc.user
      ),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    } as ITag;
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
      user:new Types.ObjectId(entity.user),
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
      order: 0,
    } as ITagDocument;
  }

  toPersistencePartial(entity: Partial<ITagWithId>): Partial<ITagDocument> {
    const update: Partial<ITagDocument> = {};
    if (entity.id ) update._id = new Types.ObjectId(entity.id);
    if (entity.name ) update.name = entity.name;
    if (entity.user ) update.user = new Types.ObjectId(entity.user)
    if (entity.isShareTag) update.isShareTag = entity.isShareTag
    if (entity.created_at) update.created_at = entity.created_at
    if (entity.updated_at) update.updated_at = entity.updated_at
    if (entity.deleted_at) update.deleted_at = entity.deleted_at
    return update;
  }

  toPersistencePopulate(entity: ITag): ITagPopulateDocument {
    const user = this.userMapper.toPersistenceWithoutPassword(entity.user);
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      isShareTag:entity.isShareTag,
      user:user,
      created_at: entity.created_at??null,
      updated_at: entity.updated_at??null,
      deleted_at: entity.deleted_at??null,
    } as ITagPopulateDocument;
  }

  toPersistencePartialPopulate(entity: Partial<ITag>): Partial<ITagPopulateDocument> {
    const update: Partial<ITagPopulateDocument> = {};
    if (entity.name ) update.name = entity.name;
    return update;
  }
}