import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { DatabaseModels } from './database/clientSchema.database.js';
import { TYPES } from '../types/dependency.type.js';
import type {
  StatisticsPeriod,
  TaskStatisticsRecord,
  PomodoroStatisticsRecord,
} from '@/application/service/statistics.service.js';

@Injectable()
export class StatisticsRepository {
  constructor(
    @Inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
  ) {}

  private async accessibleLists(userId: string) {
    const user = new Types.ObjectId(userId);
    const members = await this.db.Member.find({
      user,
      status: 'accept',
      deleted_at: null,
    })
      .select('list')
      .lean();

    const lists = await this.db.List.find({
      deleted_at: null,
      $or: [{ user }, { _id: { $in: members.map((m) => m.list) } }],
    })
      .select('_id')
      .lean();

    return lists.map((list) => list._id);
  }

  async tasks(userId: string, p: StatisticsPeriod) {
    const lists = await this.accessibleLists(userId);
    return this.db.Task.aggregate<TaskStatisticsRecord>([
      { $match: { list: { $in: lists }, deleted_at: null } },
      {
        $lookup: {
          from: this.db.Rule.collection.name,
          localField: 'rule',
          foreignField: '_id',
          as: 'rules',
          pipeline: [
            { $match: { deleted_at: null } },
            {
              $project: {
                start_date: 1,
                end_date: 1,
                timer: 1,
                endTimer: 1,
                priority: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          ruleData: { $first: '$rules' },
          anchor: {
            $ifNull: [
              { $first: '$rules.end_date' },
              { $ifNull: [{ $first: '$rules.start_date' }, '$created_at'] },
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { anchor: { $gte: p.start, $lt: p.end } },
            { status: 'done', done_at: { $gte: p.start, $lt: p.end } },
          ],
        },
      },
      { $project: { created_at: 1, status: 1, done_at: 1, ruleData: 1 } },
    ]).exec();
  }

  async pomodoro(userId: string, p: StatisticsPeriod) {
    const sessions = await this.db.pomodoro
      .find({
        user: new Types.ObjectId(userId),
        deleted_at: null,
        start: { $gte: p.start, $lt: p.end },
      })
      .select('start task progress')
      .lean<PomodoroStatisticsRecord[]>()
      .exec();
    const taskIds = [
      ...new Set(
        sessions.flatMap((session) =>
          session.task ? [session.task.toString()] : [],
        ),
      ),
    ];
    if (!taskIds.length) return sessions as any;
    const lists = await this.accessibleLists(userId);
    const tasks = await this.db.Task.find({
      _id: { $in: taskIds.map((id) => new Types.ObjectId(id)) },
      list: { $in: lists },
      deleted_at: null,
    })
      .select('_id name')
      .lean();
    const names = new Map(
      tasks.map((task) => [task._id.toString(), task.name]),
    );
    return sessions.map((session) => ({
      ...session,
      taskName: session.task
        ? (names.get(session.task.toString()) ?? null)
        : null,
    })) as any;
  }
}
