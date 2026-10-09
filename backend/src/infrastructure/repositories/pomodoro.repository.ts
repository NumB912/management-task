import { Inject, Injectable } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import {
  Ipomodoro,
  IPomodoroWithId,
} from '@/domain/entities/pomodoro.entity.js';
import { DatabaseModels } from './database/clientSchema.database.js';
import { TYPES } from '../types/dependency.type.js';
import { BaseRepository } from './base.repository.js';
import { IPomodoroRepository } from '@/domain/repositories/IPomodoro.repository.js';
import { IpomodoroDocument } from './database/schema/pomodoro.schema.js';
import { pomodoroMapper } from '../mapper/pomodoro.mapper.js';
@Injectable()
export class pomodoroRepository
  extends BaseRepository<IpomodoroDocument, IPomodoroWithId>
  implements IPomodoroRepository
{
  protected toDomain(doc: IpomodoroDocument): IPomodoroWithId {
    return this.pomodoroMapper.toDomain(doc);
  }
  protected toDomainPartial(
    doc: Partial<IpomodoroDocument>,
  ): Partial<IPomodoroWithId> {
    return this.pomodoroMapper.toDomainPartial(doc);
  }
  protected toPresistence(
    doc: Partial<IPomodoroWithId>,
  ): Partial<IpomodoroDocument> {
    return this.pomodoroMapper.toPersistencePartial(doc);
  }
  protected toPresistencePartial(
    doc: Partial<IPomodoroWithId>,
  ): Partial<IpomodoroDocument> {
    return this.pomodoroMapper.toPersistencePartial(doc);
  }
  constructor(
    @Inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @Inject(TYPES.pomodoroMapper)
    private readonly pomodoroMapper: pomodoroMapper,
  ) {
    super(db.pomodoro);
  }
  async getpomodoroDetail(userId: string): Promise<Partial<Ipomodoro>[]> {
    const docs = await this.db.pomodoro.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'tasks',
        },
      },
      {
        $set: {
          task: { $first: '$tasks' },
        },
      },
      {
        $unset: 'tasks',
      },
    ]);
    return docs.map((doc) => this.pomodoroMapper.toDomainPartialPopulate(doc));
  }

  async updateTaskToPomodoro(
    DTO: { userId: string; task?: string|null; id: string },
    session?: ClientSession
  ):Promise<boolean> {
    const { id, task, userId } = DTO;
    const userObjectId = new Types.ObjectId(userId);
      const doc = await this.db.pomodoro.updateOne({
        user:userObjectId,
        _id:new Types.ObjectId(id)
      },{
        task:task?new Types.ObjectId(task):null
      },session)
    return doc.modifiedCount > 0
  }
}
