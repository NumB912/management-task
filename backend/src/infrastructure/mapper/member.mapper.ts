import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { UserMapper } from "./user.mapper.js";
import { IMember, IMemberWithId, IRoleMember, IStatusMember } from "@/domain/entities/member.entity.js";
import { IMemberDocument, IMemberPopulateDocument } from "../repositories/database/schema/member.schema.js";
import { Types } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { TYPES } from "../types/dependency.type.js";
@Injectable()
export class MemberMapper implements IMapper<IMemberDocument, IMemberWithId, IMemberPopulateDocument, IMember> {
  constructor(
      @Inject(TYPES.UserMapper)
    private readonly userMapper: UserMapper) { }

  toDomain(doc: IMemberDocument): IMemberWithId {
    return {
      id: doc._id.toString(),
      user: doc.user?.toString()??null,
      list: doc.list.toString(),
      role: doc.role as IRoleMember,
      status: doc.status as IStatusMember,
      expired_at: doc.expire_at,
      email:doc.email,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IMemberDocument>): Partial<IMemberWithId> {
    const partial: Partial<IMemberWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.user) partial.user = doc.user.toString();
    if (doc.list) partial.list = doc.list.toString();
    if (doc.role) partial.role = doc.role as IRoleMember;
    if (doc.email) partial.email = doc.email;
    if (doc.status) partial.status = doc.status as IStatusMember;
    if (doc.expire_at) partial.expired_at = doc.expire_at;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IMemberPopulateDocument): IMember {
    return {
      id: doc._id.toString(),
      user: doc.user&&this.userMapper.toDomainWithoutPassword(doc.user),
      list:doc.list.toString(),
      role: doc.role as IRoleMember,
      status: doc.status as IStatusMember,
      email:doc.email,
      expired_at: doc.expire_at,
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IMemberPopulateDocument>): Partial<IMember> {
    const partial: Partial<IMember> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.user) partial.user = this.userMapper.toDomainWithoutPassword(doc.user);
    if (doc.list) partial.list = doc.list.toString();
    if (doc.role) partial.role = doc.role as IRoleMember;
    if (doc.status) partial.status = doc.status as IStatusMember;
    if (doc.email) partial.email = doc.email
    if (doc.expire_at) partial.expired_at = doc.expire_at;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IMemberDocument[]): IMemberWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IMemberPopulateDocument[]): IMember[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(member: IMemberWithId): IMemberDocument {
    return {
      _id: new Types.ObjectId(member.id),
      user: member.user&&new Types.ObjectId(member.user),
      list: new Types.ObjectId(member.list),
      role: member.role,
      status: member.status,
      email:member.email,
      expire_at: member.expired_at!,
      created_at: member.created_at,
      updated_at: member.updated_at ?? null,
      deleted_at: member.deleted_at ?? null,
    } as IMemberDocument;
  }

  toPersistencePartial(member: Partial<IMemberWithId>): Partial<IMemberDocument> {
    const update: Partial<IMemberDocument> = {};
    if (member.id) update._id = new Types.ObjectId(member.id);
    if (member.user) update.user = new Types.ObjectId(member.user);
    if (member.list) update.list = new Types.ObjectId(member.list);
    if (member.email) update.email = member.email
    if (member.role) update.role = member.role as IRoleMember;
    if (member.status) update.status = member.status;
    if (member.expired_at) update.expire_at = member.expired_at;
    return update;
  }

  toPersistencePartialPopulate(member: Partial<IMember>): Partial<IMemberPopulateDocument> {
    const update: Partial<IMemberPopulateDocument> = {};
    if (member.user) update.user = this.userMapper.toPersistenceWithoutPassword(member.user);
    if (member.list) update.list = new Types.ObjectId(member.list);
    if (member.role) update.role = member.role as IRoleMember;
    if (member.email) update.email = member.email
    if (member.status) update.status = member.status;
    if (member.expired_at) update.expire_at = member.expired_at;
    return update;
  }
}