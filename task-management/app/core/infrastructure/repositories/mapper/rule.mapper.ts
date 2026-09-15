import { IRule, IRuleWithId } from "@/app/core/domain/entities/rule.entities";
import { IRuleDocument, IRulePopulateDocument, ITaskDocumentPopulate } from "../database/interface";
import { Types } from "mongoose";
import { TagMapper } from "./tag.mapper";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";
import { ITask } from "@/app/core/domain";

export class RuleMapper implements IMapper<IRuleDocument, IRuleWithId, IRulePopulateDocument, IRule> {
  constructor(
  ) { }

  toDomain(doc: IRuleDocument): IRuleWithId {
    return {
      id: doc._id.toString(),
      created_at: doc.created_at,
      deleted_at: doc.deleted_at ?? null,
      updated_at: doc.updated_at ?? null,
      path: doc.path,
      task: doc.task?.toString()??null,
      list:doc.list.toString(),
      tags:doc.tags,
      color: doc.color,
      end_date: doc.end_date,
      priority: doc.priority,
      repeat: doc.repeat,
      timer: doc.timer,
      endTimer:doc.endTimer,
      start_date: doc.start_date,
    };
  }

  toDomainPartial(doc: Partial<IRuleDocument>): Partial<IRuleWithId> {
    const partial: Partial<IRuleWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.path) partial.path = doc.path;
    if (doc.task) partial.task = doc.task.toString();
    if (doc.start_date) partial.start_date = doc.start_date;
    if (doc.end_date) partial.end_date = doc.end_date;
    if (doc.priority) partial.priority = doc.priority;
    if (doc.repeat) partial.repeat = doc.repeat;
    if (doc.timer) partial.timer = doc.timer;
    if (doc.endTimer) partial.endTimer = doc.endTimer
    if (doc.list) partial.list = doc.list.toString()
    if (doc.tags) partial.tags = doc.tags.map((tag)=>tag.toString())
    if (doc.color) partial.color = doc.color;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IRulePopulateDocument): IRule {
    console.log(doc)
    return {
      id: doc._id.toString(),
      list:doc.list.toString(),
      created_at: doc.created_at,
      deleted_at: doc.deleted_at ?? null,
      updated_at: doc.updated_at ?? null,
      path: doc.path,
      tags:doc.tags??[],
      color:doc.color,
      task: doc.task?.toString(),
      end_date: doc.end_date,
      priority: doc.priority,
      repeat: doc.repeat,
      timer: doc.timer,
      endTimer: doc.endTimer,
      start_date: doc.start_date,
    };
  }

  toDomainPopulateTask(doc: ITaskDocumentPopulate): ITask {
    return {
      id: doc._id.toString(),
      name: doc.name,
      path: doc.path ?? "",
      parent: doc.parent ? this.toDomainPopulateTask(doc.parent) : undefined,
      children: doc.children ? doc.children.map(child => this.toDomainPopulateTask(child)) : [],
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
      list:doc.list.toString(),
      description: doc.description,
      done_at: doc.done_at,
      order: doc.order,
      rule:this.toDomainPopulate(doc.rule),
      section: doc.section.toString(),
      status: doc.status,
    };
  }

  toDomainPartialPopulate(doc: Partial<IRulePopulateDocument>): Partial<IRule> {
    const partial: Partial<IRule> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.path) partial.path = doc.path;
    if (doc.task) partial.task = doc.task.toString();
    if (doc.start_date) partial.start_date = doc.start_date;
    if (doc.end_date) partial.end_date = doc.end_date;
    if (doc.priority) partial.priority = doc.priority;
    if (doc.repeat) partial.repeat = doc.repeat;
    if (doc.list) partial.list = doc.list.toString()
    if (doc.tags) partial.tags = doc.tags
    if (doc.color) partial.color = doc.color;
    if (doc.timer) partial.timer = doc.timer;
    if (doc.endTimer) partial.endTimer = doc.endTimer;
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IRuleDocument[]): IRuleWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IRulePopulateDocument[]): IRule[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IRuleWithId): Partial<IRuleDocument> {
    return {
      _id: new Types.ObjectId(entity.id),
      start_date: entity.start_date,
      end_date: entity.end_date,
      path: entity.path,
      priority: entity.priority ?? 1,
      repeat: entity.repeat,
      tags: entity.tags ? entity.tags.map(t =>new Types.ObjectId(t)) : [],
      timer: entity.timer,
      endTimer: entity.endTimer,
      color: entity.color,
      task: entity.task as unknown as Types.ObjectId,
      list:new  Types.ObjectId(entity.list),
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as unknown as Partial<IRuleDocument>;
  }

toPersistencePartial(entity: Partial<IRuleWithId>): Partial<IRuleDocument> {
  const update: Partial<IRuleDocument> = {};
  if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
  if (entity.start_date !== undefined) update.start_date = entity.start_date;
  if (entity.end_date !== undefined) update.end_date = entity.end_date;
  if (entity.path !== undefined) update.path = entity.path;
  if (entity.priority !== undefined) update.priority = entity.priority;
  if (entity.repeat !== undefined) update.repeat = entity.repeat;
  if (entity.tags !== undefined) update.tags = entity.tags;
  if (entity.list !== undefined) update.list = new Types.ObjectId(entity.list);
  if (entity.timer !== undefined) update.timer = entity.timer;
  if (entity.endTimer !== undefined) update.endTimer = entity.endTimer;
  if (entity.color !== undefined) update.color = entity.color;
  if (entity.task !== undefined) update.task = entity.task?new Types.ObjectId(entity.task):undefined;

  return update;
}

  toPersistencePopulate(entity: IRule): IRulePopulateDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      start_date: entity.start_date,
      end_date: entity.end_date,
      path: entity.path,
      priority: entity.priority ?? 1,
      repeat: entity.repeat,
      timer: entity.timer,
      endTimer: entity.endTimer,
      list:new  Types.ObjectId(entity.list),
      task:entity.task?new Types.ObjectId(entity.task):undefined,
      tags:entity.tags??[],
      created_at: entity.created_at,
      color:entity.color,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    };
  }

  toPersistencePopulateTask(entity: ITask): Partial<ITaskDocumentPopulate> {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      path: entity.path,
      parent: entity.parent ? this.toPersistencePopulateTask(entity.parent) as ITaskDocumentPopulate : undefined,
      children: entity.children ? entity.children.map(child => this.toPersistencePopulateTask(child) as ITaskDocumentPopulate) : [],
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
      list:new  Types.ObjectId(entity.list),
      description: entity.description,
      done_at: entity.done_at,
      order: entity.order,
      rule: entity.rule ? this.toPersistencePopulate(entity.rule) : undefined,
      section: new Types.ObjectId(entity.section),
      status: entity.status,
    };
  }


  toPersistencePartialPopulate(entity: Partial<IRule>): Partial<IRulePopulateDocument> {
    const update: Partial<IRulePopulateDocument> = {};
    if (entity.start_date) update.start_date = entity.start_date;
    if (entity.end_date) update.end_date = entity.end_date;
    if (entity.path) update.path = entity.path;
    if (entity.priority) update.priority = entity.priority;
    if (entity.repeat) update.repeat = entity.repeat;
    if (entity.timer) update.timer = entity.timer;
    if (entity.endTimer) update.endTimer = entity.endTimer;
    if (entity.color) update.color = entity.color;
    if (entity.task) update.task = new Types.ObjectId(entity.task);
    if (entity.list) update.list = new Types.ObjectId(entity.list)
    if (entity.tags) update.tags = entity.tags??[]
    if (entity.id) update._id =new Types.ObjectId( entity.id)
    return update;
  }
}