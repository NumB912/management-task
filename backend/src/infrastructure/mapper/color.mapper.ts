import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { IColor, ITypeColor } from "@/domain/entities/color.entity.js";
import { IColorDocument } from "../repositories/database/schema/color.schema.js";
import { Types } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ColorMapper
  implements IMapper<IColorDocument, IColor, IColorDocument, IColor>
{
  constructor() {}

  toDomain(doc: IColorDocument): IColor {
    return {
      id: doc._id.toString(),
      color: doc.color,
      type: doc.type as ITypeColor,
      refId: doc.refId.toString(),
      user: doc.user.toString(),
      path:doc.path.toString(),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IColorDocument>): Partial<IColor> {
    const partial: Partial<IColor> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.color !== undefined) partial.color = doc.color;
    if (doc.type !== undefined) partial.type = doc.type as ITypeColor;
    if (doc.refId) partial.refId = doc.refId.toString();
    if (doc.user) partial.user = doc.user.toString();
    if (doc.path) partial.path = doc.path.toString()
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IColorDocument): IColor {
    return this.toDomain(doc);
  }

  toDomainPartialPopulate(doc: Partial<IColorDocument>): Partial<IColor> {
    return this.toDomainPartial(doc);
  }

  toDomainList(docs: IColorDocument[]): IColor[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IColorDocument[]): IColor[] {
    return docs.map((doc) => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IColor): IColorDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      color: entity.color,
      type: entity.type,
      refId: new Types.ObjectId(entity.refId),
      user: new Types.ObjectId(entity.user),
      path:entity.path,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IColorDocument;
  }

  toPersistencePartial(entity: Partial<IColor>): Partial<IColorDocument> {
    const update: Partial<IColorDocument> = {};
    if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
    if (entity.color !== undefined) update.color = entity.color;
    if (entity.type !== undefined) update.type = entity.type;
    if (entity.refId !== undefined)
      update.refId = new Types.ObjectId(entity.refId);
    if (entity.user !== undefined)
      update.user = new Types.ObjectId(entity.user);
    if (entity.created_at !== undefined)
      update.created_at = entity.created_at;
    if (entity.updated_at !== undefined)
      update.updated_at = entity.updated_at;
    if(entity.path!==undefined)
      update.path = entity.path
    if (entity.deleted_at !== undefined)
      update.deleted_at = entity.deleted_at;
    return update;
  }

  toPersistencePopulate(entity: IColor): IColorDocument {
    return this.toPersistence(entity);
  }

  toPersistencePartialPopulate(
    entity: Partial<IColor>
  ): Partial<IColorDocument> {
    return this.toPersistencePartial(entity);
  }
}
