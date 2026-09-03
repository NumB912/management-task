import { ITask, ITaskPartial, ITaskWithId } from "@/app/core/domain/entities/task.entites";
import {ITaskDocument, ITaskDocumentPopulate } from "../database/interface";
import { RuleMapper } from "./rule.mapper";
import { Types } from "mongoose";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";

export class TaskMapper implements IMapper<ITaskDocument, ITaskWithId, ITaskDocumentPopulate, ITask,ITaskPartial> {
  constructor(
    private readonly ruleMapper: RuleMapper,
  ) { }

  toDomain(doc: ITaskDocument): ITaskWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      path: doc.path??"",
      parent: doc.parent?._id.toString(),
      children: doc.children ? doc.children.map(child => child._id.toString()) : [],
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
      description: doc.description,
      list:doc.list.toString(),

      done_at: doc.done_at,
      order: doc.order,
      rule: doc.rule?._id.toString(),
      section: doc.section._id.toString(),
      status: doc.status,
    };
  }

  toDomainPartial(doc: Partial<ITaskDocument>): Partial<ITaskWithId> {
    const partial: Partial<ITaskWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.path) partial.path = doc.path;
    if (doc.parent) partial.parent = doc.parent?._id.toString();
    if (doc.children) partial.children = doc.children.map(child => child._id.toString());
    if (doc.description) partial.description = doc.description;
    if (doc.list) partial.list = doc.list.toString()
    if (doc.done_at) partial.done_at = doc.done_at;
    if (doc.order) partial.order = doc.order;
    if (doc.rule) partial.rule = doc.rule?._id.toString();
    if (doc.section) partial.section = doc.section._id.toString();
    if (doc.status) partial.status = doc.status;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: ITaskDocumentPopulate): ITask {
    return {
      id: doc._id.toString(),
      name: doc.name,
      path: doc.path??"",
      parent: doc.parent ? this.toDomainPopulate(doc.parent) : undefined,
      children: doc.children ? doc.children.map(child => this.toDomainPopulate(child)) : [],
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
      list:doc.list.toString(),
      description: doc.description,
      done_at: doc.done_at,
      order: doc.order,
      rule: doc.rule ? this.ruleMapper.toDomainPopulate(doc.rule) : undefined,
      section: doc.section.toString(),
      status: doc.status,
    };
  }

  toDomainPartialPopulate(doc: Partial<ITaskDocumentPopulate>): Partial<ITaskPartial> {
    const partial: Partial<ITaskPartial> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.path) partial.path = doc.path;
    if (doc.parent) partial.parent = doc.parent ? this.toDomainPartialPopulate(doc.parent) : undefined;
    if (doc.children) partial.children = doc.children.map(child => this.toDomainPartialPopulate(child));
    if (doc.description) partial.description = doc.description;
    if (doc.done_at) partial.done_at = doc.done_at;
    if (doc.order) partial.order = doc.order;
    if (doc.rule) partial.rule = doc.rule ? this.ruleMapper.toDomainPartialPopulate(doc.rule) : undefined;
    if (doc.section) partial.section = doc.section.toString()
    if (doc.status) partial.status = doc.status;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    if (doc.list) partial.list = doc.list.toString()
    return partial;
  }

  toDomainList(docs: ITaskDocument[]): ITaskWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPopulateList(docs: ITaskDocumentPopulate[]): ITask[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: ITaskWithId): Partial<ITaskDocument> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      children: entity.children
        ? entity.children?.map((child) => new Types.ObjectId(child))
        : [],
      section: new Types.ObjectId(entity.section),
      parent: entity.parent ? new Types.ObjectId(entity.parent) : undefined,
      order: entity.order,
      path: entity.path,
      description: entity.description,
      status: entity.status,
      rule: entity.rule ? new Types.ObjectId(entity.rule) : undefined,
      done_at: entity.done_at,
      list:new Types.ObjectId(entity.list),

      created_at: entity.created_at,
      deleted_at: entity.deleted_at ?? null,
      updated_at: entity.updated_at ?? null,
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

    if (entity.section) {
      update.section = new Types.ObjectId(entity.section);
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

  toPersistencePopulate(entity: ITask): Partial<ITaskDocumentPopulate> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      path: entity.path,
      parent: entity.parent ? this.toPersistencePopulate(entity.parent) as ITaskDocumentPopulate : undefined,
      children: entity.children ? entity.children.map(child => this.toPersistencePopulate(child) as ITaskDocumentPopulate) : [],
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
      description: entity.description,

      list:new Types.ObjectId(entity.list),
      done_at: entity.done_at,
      order: entity.order,
      rule: entity.rule ? this.ruleMapper.toPersistencePopulate(entity.rule) : undefined,
      section: new Types.ObjectId(entity.section),
      status: entity.status,
    };
  }

  toPersistencePartialPopulate(entity: Partial<ITask>): Partial<ITaskDocumentPopulate> {
    const update: Partial<ITaskDocumentPopulate> = {};
    if (entity.name) update.name = entity.name;
    if (entity.path) update.path = entity.path;
    if (entity.description) update.description = entity.description;
    if (entity.status) update.status = entity.status;
    if (entity.order) update.order = entity.order;
    if (entity.id) update._id = new Types.ObjectId( entity.id)
    if (entity.done_at) update.done_at = entity.done_at;
    if (entity.section) update.section = new Types.ObjectId(entity.section)
    if (entity.parent) update.parent = entity.parent ? this.toPersistencePopulate(entity.parent) as ITaskDocumentPopulate : undefined;
    if (entity.rule) update.rule = entity.rule ? this.ruleMapper.toPersistencePopulate(entity.rule)  : undefined;
    if (entity.children) update.children = entity.children.map(child => this.toPersistencePopulate(child) as ITaskDocumentPopulate);
    if(entity.list) update.list = new Types.ObjectId(entity.list)
    return update;
  }
}