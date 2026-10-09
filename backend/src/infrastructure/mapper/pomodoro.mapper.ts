import { IMapper } from "@/domain/mapper/Imapper.mapper.js";
import { Types } from "mongoose";
import { Ipomodoro, IPomodoroWithId } from "@/domain/entities/pomodoro.entity.js";
import {
  IpomodoroDocument,
  IpomodoroDocumentPopulate,
} from "../repositories/database/schema/pomodoro.schema.js";
import { ITask } from "@/domain/entities/task.entity.js";
import { Injectable } from "@nestjs/common";
@Injectable()
export class pomodoroMapper implements IMapper<IpomodoroDocument, IPomodoroWithId, IpomodoroDocumentPopulate, Ipomodoro> {
  toDomain(doc: IpomodoroDocument): IPomodoroWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      task: doc.task?.toString()??undefined,
      start: doc.start,
      totalDuration: doc.totalDuration,
      progress: doc.progress?.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as unknown as Ipomodoro["progress"] ?? [],
      user:doc.user.toString(),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IpomodoroDocument>): Partial<IPomodoroWithId> {
    const partial: Partial<IPomodoroWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.task) partial.task = doc.task.toString();
    if (doc.start) partial.start = doc.start;
    if (doc.progress) partial.progress = doc.progress.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as Ipomodoro["progress"]
    if (doc.totalDuration !== undefined) partial.totalDuration = doc.totalDuration;
    if (doc.user) partial.user = doc.user.toString()
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IpomodoroDocumentPopulate): Ipomodoro {
    return {
      id: doc._id.toString(),
      name: doc.name,
      task: doc.task&&{
        id: doc._id.toString(),
        name: doc.name,
      } as unknown as Pick<ITask,"id"|"name">|undefined,
      start: doc.start,
        totalDuration: doc.totalDuration,
      progress: doc.progress?.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) as unknown as Ipomodoro["progress"] ?? [],
      user:doc.user.toString(),
      created_at: doc.created_at,
      updated_at: doc.updated_at ?? undefined,
      deleted_at: doc.deleted_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IpomodoroDocumentPopulate>): Partial<Ipomodoro> {
    const partial: Partial<Ipomodoro> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.task) partial.task = doc.task ? { id: doc.task._id.toString(), name: doc.task.name } : undefined;
    if (doc.start) partial.start = doc.start;
    if (doc.totalDuration !== undefined) partial.totalDuration = doc.totalDuration;
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

  toDomainList(docs: IpomodoroDocument[]): IPomodoroWithId[] {
    return docs.map((doc) => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IpomodoroDocumentPopulate[]): Ipomodoro[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(entity: IPomodoroWithId): IpomodoroDocument {
    console.log(entity)
    return {
      _id: new Types.ObjectId(entity.id),
      name: entity.name,
      task: new Types.ObjectId(entity.task),
      start: entity.start,
      progress: entity.progress.map((it) => ({
        duration: it.duration,
        startPause: it.startPause,
      })) as IpomodoroDocument["progress"],
      totalDuration: entity.totalDuration,
      user: new Types.ObjectId(entity.user),
      created_at: entity.created_at,
      updated_at: entity.updated_at ?? null,
      deleted_at: entity.deleted_at ?? null,
    } as unknown as IpomodoroDocument;
  }

  toPersistencePartial(entity: Partial<IPomodoroWithId>): Partial<IpomodoroDocument> {
       console.log(entity)
    const update: Partial<IpomodoroDocument> = {};
    if (entity.id !== undefined) update._id = new Types.ObjectId(entity.id);
    if (entity.name !== undefined) update.name = entity.name;
    if (entity.task !== undefined) update.task = new Types.ObjectId(entity.task);
    if (entity.start !== undefined) update.start = entity.start;
    if (entity.totalDuration !== undefined) update.totalDuration = entity.totalDuration;
    if (entity.progress) update.progress = entity.progress.map((t) => ({
        startPause:t.startPause,
        duration:t.duration 
      })) 
    if (entity.user) update.user = new Types.ObjectId(entity.user)
    if (entity.deleted_at !== undefined) update.deleted_at = entity.deleted_at ?? null;
    if (entity.updated_at !== undefined) update.updated_at = entity.updated_at ?? null;
    return update;
  }
}