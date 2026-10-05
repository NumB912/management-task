import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { Types } from "mongoose";
import { IUserDocument, IUserWithoutPasswordDocument } from "../repositories/database/schema/user.schema.js";
import { IRole, IUser, IUserWithouPassword } from "@/domain/entities/user.entity.js";
import { Injectable } from "@nestjs/common";
@Injectable()
export class UserMapper implements IMapper<IUserDocument, IUser, IUserDocument, IUserWithouPassword> {
  toDomain(doc: IUserDocument): IUser {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      avatar: doc.avatar,
      role: doc.role as IRole,
      password: doc.password,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IUserDocument>): Partial<IUser> {
    const update: Partial<IUser> = {};
    if (doc._id) update.id = doc._id.toString();
    if (doc.name) update.name = doc.name;
    if (doc.email) update.email = doc.email;
    if (doc.avatar) update.avatar = doc.avatar;
    if (doc.role) update.role = doc.role as IRole;
    if (doc.password) update.password = doc.password;
    if (doc.created_at) update.created_at = doc.created_at;
    if (doc.updated_at) update.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) update.deleted_at = doc.deleted_at ?? undefined;
    return update;
  }

  toDomainPopulate(doc: IUserDocument): IUserWithouPassword {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      avatar: doc.avatar,
      role: doc.role as IRole,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? null,
      deleted_at: doc.deleted_at ?? null,
    };
  }
  toDomainWithoutPassword(doc: IUserWithoutPasswordDocument): IUserWithouPassword {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      avatar: doc.avatar,
      role: doc.role as IRole,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? null,
      deleted_at: doc.deleted_at ?? null,
    };
  }

  toDomainPartialPopulate(doc: Partial<IUserDocument>): Partial<IUserWithouPassword> {
    const update: Partial<IUserWithouPassword> = {};
    if (doc._id) update.id = doc._id.toString();
    if (doc.name) update.name = doc.name;
    if (doc.email) update.email = doc.email;
    if (doc.avatar) update.avatar = doc.avatar;
    if (doc.role) update.role = doc.role as IRole;
    if (doc.created_at) update.created_at = doc.created_at;
    if (doc.updated_at) update.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) update.deleted_at = doc.deleted_at ?? undefined;
    return update;
  }

  toDomainList(docs: IUserDocument[]): IUser[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IUserDocument[]): IUserWithouPassword[] {
    return docs.map((doc) => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IUser): IUserDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      email: entity.email,
      avatar: entity.avatar,
      role: entity.role,
      password: entity.password,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IUserDocument;
  }

    toPersistenceWithoutPassword(entity: IUserWithouPassword): IUserWithoutPasswordDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      email: entity.email,
      avatar: entity.avatar,
      role: entity.role as IRole,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IUserWithoutPasswordDocument;
  }
  toPersistenceWithoutPasswordPartial(entity:IUserWithouPassword):Partial<IUserWithoutPasswordDocument>{
    const update: Partial<IUserWithoutPasswordDocument> = {};
    if (entity.id) update._id = new Types.ObjectId(entity.id)
    if (entity.name) update.name = entity.name;
    if (entity.avatar) update.avatar = entity.avatar;
    if (entity.role) update.role = entity.role;
    if (entity.email) update.email = entity.email;
    if (entity.deleted_at) update.deleted_at = entity.deleted_at ?? null;
    if (entity.updated_at) update.updated_at = entity.updated_at ?? null;
    return update;
  }
toPersistencePartial(entity: Partial<IUser>): Partial<IUserDocument> {
    const update: Partial<IUserDocument> = {};
    if (entity.id) update._id = new Types.ObjectId(entity.id);
    if (entity.name) update.name = entity.name;
    if (entity.avatar) update.avatar = entity.avatar;
    if (entity.role) update.role = entity.role;
    if (entity.email) update.email = entity.email;
    if (entity.password) update.password = entity.password;
    if (entity.deleted_at) update.deleted_at = entity.deleted_at ?? null;
    if (entity.updated_at) update.updated_at = entity.updated_at ?? null;
    return update;
  }
}