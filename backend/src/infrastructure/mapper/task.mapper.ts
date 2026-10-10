import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { ITaskDocument, ITaskPopulateDocument } from "../repositories/database/schema/task.schema.js";
import { IRuleDocument } from "../repositories/database/schema/rule.schema.js";
import { IStatusTask, ITask, ITaskWithId } from "@/domain/entities/task.entity.js";
import { RuleMapper } from "./rule.mapper.js";
import { Inject, Injectable } from "@nestjs/common";
import { TYPES } from "../types/dependency.type.js";
import { Types } from "mongoose";

@Injectable()
export class TaskMapper implements IMapper<ITaskDocument, ITaskWithId, ITaskPopulateDocument, ITask> {
  constructor(
    @Inject(TYPES.RuleMapper)
    private readonly ruleMapper: RuleMapper,
  ) { }

  toDomain(doc: ITaskDocument): ITaskWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      path: doc.path??"",
      parent: doc.parent?.toString(),
      children: doc.children ? doc.children.map(child => child.toString()) : [],
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
      description: doc.description,
      list:doc.list.toString(),
      done_at: doc.done_at,
      order: doc.order,
      rule: doc.rule?.toString(),
      section: doc.section?.toString()??null,
      status: doc.status as IStatusTask,
    };
  }

  toDomainPartial(doc: Partial<ITaskDocument>): Partial<ITaskWithId> {
    const partial: Partial<ITaskWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.path) partial.path = doc.path;
    if (doc.parent) partial.parent = doc.parent?.toString();
    if (doc.children) partial.children = doc.children.map(child => child.toString());
    if (doc.description) partial.description = doc.description;
    if (doc.list) partial.list = doc.list.toString()
    if (doc.done_at) partial.done_at = doc.done_at;
    if (doc.order) partial.order = doc.order;
    if (doc.rule) partial.rule = doc.rule?.toString();
    if (doc.section) partial.section = doc.section.toString();
    if (doc.status) partial.status = doc.status as IStatusTask;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: ITaskPopulateDocument): ITask {
    return {
      id: doc._id.toString(),
      name: doc.name,
      path: doc.path??"",
      parent: doc.parent ? this.toDomain(doc.parent) : undefined,
      children: doc.children ? doc.children.map(child => this.toDomain(child)) : [],
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
      list:doc.list?.toString(),
      description: doc.description,
      done_at: doc.done_at,
      order: doc.order,
      rule: doc.rule ? this.ruleMapper.toDomainPopulate(doc.rule) : undefined,
      section: doc.section?.toString()??null,
      status: doc.status as IStatusTask,
    };
  }

  toDomainList(docs: ITaskDocument[]): ITaskWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPartialPopulate(doc: Partial<ITaskPopulateDocument>): Partial<ITask> {
    const partial: Partial<ITask> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.path) partial.path = doc.path;
    if (doc.parent) partial.parent = this.toDomain(doc.parent as ITaskDocument) as unknown as ITaskWithId;
    if (doc.children) partial.children = doc.children.map(child => this.toDomain(child as ITaskDocument)) as unknown as ITaskWithId[];
    if (doc.description) partial.description = doc.description;
    if (doc.list) partial.list = doc.list.toString();
    if (doc.done_at) partial.done_at = doc.done_at;
    if (doc.order) partial.order = doc.order;
    if (doc.rule) partial.rule = this.ruleMapper.toDomainPopulate(doc.rule as IRuleDocument);
    if (doc.section) partial.section = doc.section.toString();
    if (doc.status) partial.status = doc.status as IStatusTask;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulateList(docs: ITaskPopulateDocument[]): ITask[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: ITaskWithId): Partial<ITaskDocument> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      children: entity.children
        ? entity.children?.map((child) => new Types.ObjectId(child))
        : [],
      section: entity.section?new Types.ObjectId(entity?.section):undefined,
      parent: entity.parent ? new Types.ObjectId(entity.parent) : undefined,
      order: entity.order,
      path: entity.path,
      description: entity.description,
      status: entity.status,
      rule: entity.rule ? new Types.ObjectId(entity.rule) : undefined,
      done_at: entity.done_at,
      list:new Types.ObjectId(entity.list),

      created_at: entity.created_at,
      deleted_at: entity.deleted_at,
      updated_at: entity.updated_at,
    };
  }

  toPersistencePartial(entity: Partial<ITaskWithId>): Partial<ITaskDocument> {
    const update: Partial<ITaskDocument> = {};
    if (entity.id) update._id = new Types.ObjectId(entity.id);
    if (entity.name) update.name = entity.name;
    if (entity.path) update.path = entity.path;
    if (entity.description)
      update.description = entity.description;
    if (entity.status) update.status = entity.status;
    if (entity.order) update.order = entity.order;

    if (entity.done_at) update.done_at = entity.done_at;

    if (entity.section!==undefined) {
      update.section = entity.section?new Types.ObjectId(entity.section):null;
    }

    if (entity.parent) {
      update.parent = entity.parent
        ? new Types.ObjectId(entity.parent)
        : undefined;
    }

    if (entity.rule) {
      update.rule = entity.rule
        ? new Types.ObjectId(entity.rule)
        : undefined;
    }

    if (entity.children) {
      update.children = entity.children.map(
        (child) => new Types.ObjectId(child),
      );
    }
    if(entity.list) update.list = new Types.ObjectId(entity.list)
    if (entity.deleted_at) {
      update.deleted_at = entity.deleted_at ?? null;
    }

    update.updated_at = new Date();

    return update;
  }

  toPersistencePopulate(entity: ITask): Partial<ITaskPopulateDocument> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      path: entity.path,
      parent: entity.parent ? this.toPersistence(entity.parent) as ITaskDocument : undefined,
      children: entity.children
        ? entity.children.map(child => this.toPersistence(child) as ITaskDocument)
        : [],
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      deleted_at: entity.deleted_at,
      description: entity.description,

      list:new Types.ObjectId(entity.list),
      done_at: entity.done_at,
      order: entity.order,
      rule: entity.rule ? this.ruleMapper.toPersistencePopulate(entity.rule) : undefined,
      section: entity.section?new Types.ObjectId(entity?.section):undefined,
      status: entity.status,
    };
  }
}
