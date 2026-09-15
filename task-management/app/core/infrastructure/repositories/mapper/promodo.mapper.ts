import { Types } from "mongoose";
import { IPromodoDocument, IPromodoDocumentPopulate } from "../database/interface/promodo.document";
import { IPromodo, IPromodoWithId } from "@/app/core/domain/entities/promodo.entities";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";
import { ITask } from "@/app/core/domain";

export class PromodoMapper implements IMapper<IPromodoDocument, IPromodoWithId, IPromodoDocumentPopulate, IPromodo> {
  toDomain(doc: IPromodoDocument): IPromodoWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      task: doc.task?.toString()??undefined,
      start: doc.start,
      duration: doc.duration,
      progress: doc.progress?.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as unknown as IPromodo["progress"] ?? [],
      user:doc.user.toString(),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IPromodoDocument>): Partial<IPromodoWithId> {
    const partial: Partial<IPromodoWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.task) partial.task = doc.task.toString();
    if (doc.start) partial.start = doc.start;
    if (doc.progress) partial.progress = doc.progress.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as IPromodo["progress"]
    if (doc.duration !== undefined) partial.duration = doc.duration;
    if (doc.user) partial.user = doc.user.toString()
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IPromodoDocumentPopulate): IPromodo {
    return {
      id: doc._id.toString(),
      name: doc.name,
      task: doc.task&&{
        id: doc._id.toString(),
        name: doc.name,
      } as unknown as Pick<ITask,"id"|"name">|undefined,
      start: doc.start,
      duration: doc.duration,
      progress: doc.progress?.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as unknown as IPromodo["progress"] ?? [],
      user:doc.user.toString(),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IPromodoDocumentPopulate>): Partial<IPromodo> {
    const partial: Partial<IPromodo> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.task) partial.task = doc.task ? { id: doc.task._id.toString(), name: doc.task.name } : undefined;
    if (doc.start) partial.start = doc.start;
    if (doc.duration !== undefined) partial.duration = doc.duration;
    if (doc.progress) partial.progress = doc.progress.map((t) => ({
      startPause: t.startPause,
      duration: t.duration
    }));
    if (doc.user) partial.user = doc.user.toString();
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IPromodoDocument[]): IPromodoWithId[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IPromodoDocumentPopulate[]): IPromodo[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IPromodoWithId): IPromodoDocument {
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      task: new Types.ObjectId(entity.task),
      start: entity.start,
      progress: entity.progress.map((it) => ({
        duration:it.duration,
        startPause:it.startPause,
      })) as IPromodoDocument["progress"],
      user: new Types.ObjectId(entity.user),
      duration: entity.duration,
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as IPromodoDocument;
  }

  toPersistencePartial(entity: Partial<IPromodoWithId>): Partial<IPromodoDocument> {
    const update: Partial<IPromodoDocument> = {};
    if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
    if (entity.name !== undefined) update.name = entity.name;
    if (entity.task !== undefined) update.task = new Types.ObjectId(entity.task);
    if (entity.start !== undefined) update.start = entity.start;
    if (entity.duration !== undefined) update.duration = entity.duration;
    if (entity.progress) update.progress = entity.progress.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) 
    if (entity.user) update.user = new Types.ObjectId(entity.user)
    if (entity.deleted_at !== undefined) update.deleted_at = entity.deleted_at ?? null;
    if (entity.updated_at !== undefined) update.updated_at = entity.updated_at ?? null;
    return update;
  }

  toPersistencePopulate(entity: IPromodo): IPromodoDocumentPopulate {
    return {
      _id:new Types.ObjectId(entity.id),
      created_at:entity.created_at,
      deleted_at:entity.deleted_at??null,
      duration:entity.duration,
      name:entity.name,
      start:entity.start,
      progress: entity.progress as unknown as IPromodoDocumentPopulate["progress"],
      updated_at:entity.updated_at??null,
      user:new Types.ObjectId(entity.user),
    }
  }

  toPersistencePartialPopulate(entity: Partial<IPromodo>): Partial<IPromodoDocumentPopulate> {
    const update: Partial<IPromodoDocumentPopulate> = {};
    if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
    if (entity.name !== undefined) update.name = entity.name;
    if (entity.task !== undefined) update.task = entity.task ? { _id: new Types.ObjectId(entity.task.id), name: entity.task.name } : undefined;
    if (entity.start !== undefined) update.start = entity.start;
    if (entity.duration !== undefined) update.duration = entity.duration;
    if (entity.progress) update.progress = entity.progress.map((t) => ({
        startPause: t.startPause,
        duration: t.duration
      }));
    if (entity.user) update.user = new Types.ObjectId(entity.user);
    if (entity.deleted_at !== undefined) update.deleted_at = entity.deleted_at ?? null;
    if (entity.updated_at !== undefined) update.updated_at = entity.updated_at ?? null;
    if (entity.created_at !== undefined) update.created_at = entity.created_at;
    return update;
  }
}