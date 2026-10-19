import { Inject, Injectable } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import type {
  IAdminRepository,
  AdminUsersPage,
  AdminUserSummary,
  AdminUserUpdate,
  AdminActivityData,
  AdminUserWorkData,
} from '@/domain/repositories/IAdmin.repository.js';
import { DatabaseModels } from './database/clientSchema.database.js';
import { TYPES } from '../types/dependency.type.js';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @Inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
  ) {}

  async findUserWorkStatistics({
    userId,
    start,
    end,
  }: {
    userId: string;
    start: Date;
    end: Date;
  }): Promise<AdminUserWorkData> {
    const lists = await this.db.List.find({
      user: new Types.ObjectId(userId),
      deleted_at: null,
    })
      .select('_id')
      .lean();
    if (!lists.length) return { totalLists: 0, totalTasks: 0, daily: [] };
    const [result] = await this.db.Task.aggregate<{
      totals: { count: number }[];
      daily: { date: string; completedTasks: number }[];
    }>([
      {
        $match: {
          list: { $in: lists.map((list) => list._id) },
          deleted_at: null,
        },
      },
      {
        $facet: {
          totals: [{ $count: 'count' }],
          daily: [
            { $match: { status: 'done', done_at: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: {
                  $dateToString: {
                    date: '$done_at',
                    format: '%Y-%m-%d',
                    timezone: 'Asia/Ho_Chi_Minh',
                  },
                },
                completedTasks: { $sum: 1 },
              },
            },
            { $project: { _id: 0, date: '$_id', completedTasks: 1 } },
            { $sort: { date: 1 } },
          ],
        },
      },
    ]);
    return {
      totalLists: lists.length,
      totalTasks: result?.totals[0]?.count ?? 0,
      daily: result?.daily ?? [],
    };
  }

  async findUser(id: string): Promise<AdminUserSummary | null> {
    const user = await this.db.User.findOne({ _id: id, deleted_at: null })
      .select('_id name email role blocked created_at')
      .lean();
    return user ? this.toSummary(user) : null;
  }

  async updateUser(
    id: string,
    update: AdminUserUpdate,
    options: { excludeAdmins: boolean },
  ): Promise<AdminUserSummary | null> {
    const user = await this.db.User.findOneAndUpdate(
      {
        _id: id,
        deleted_at: null,
        ...(options.excludeAdmins ? { role: { $ne: 'admin' } } : {}),
      },
      { $set: { ...update, updated_at: new Date() } },
      { new: true, runValidators: true },
    )
      .select('_id name email role blocked created_at')
      .lean();
    return user ? this.toSummary(user) : null;
  }

  private toSummary(user: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
    blocked?: boolean;
    created_at: Date;
  }): AdminUserSummary {
    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked ?? false,
      created_at: user.created_at,
    };
  }
  async findActivity({
    start,
    end,
    userId,
  }: {
    start: Date;
    end: Date;
    userId?: string;
  }): Promise<AdminActivityData> {
    const timezone = 'Asia/Ho_Chi_Minh';
    const [result] = await this.db.pomodoro.aggregate([
      {
        $match: {
          deleted_at: null,
          start: { $gte: start, $lte: end },
          ...(userId ? { user: new Types.ObjectId(userId) } : {}),
        },
      },
      {
        $facet: {
          daily: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    date: '$start',
                    format: '%Y-%m-%d',
                    timezone,
                  },
                },
                sessions: { $sum: 1 },
                users: { $addToSet: '$user' },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                sessions: 1,
                activeUsers: { $size: '$users' },
              },
            },
            { $sort: { date: 1 } },
          ],
          hourly: [
            {
              $group: {
                _id: { $hour: { date: '$start', timezone } },
                sessions: { $sum: 1 },
              },
            },
          ],
          summary: [
            {
              $group: {
                _id: null,
                sessions: { $sum: 1 },
                users: { $addToSet: '$user' },
              },
            },
            {
              $project: {
                _id: 0,
                sessions: 1,
                activeUsers: { $size: '$users' },
              },
            },
          ],
        },
      },
    ]);

    return {
      daily: result.daily,
      hourly: result.hourly.map((row: { _id: number; sessions: number }) => ({
        hour: row._id,
        sessions: row.sessions,
      })),
      summary: result.summary[0] ?? { sessions: 0, activeUsers: 0 },
    };
  }
  async isActiveAdmin(userId: string): Promise<boolean> {
    if (!isValidObjectId(userId)) return false;
    return Boolean(
      await this.db.User.exists({
        _id: userId,
        role: 'admin',
        deleted_at: null,
        blocked: { $ne: true },
      }),
    );
  }

  async findUsers({
    page,
    pageSize,
    search,
  }: {
    page: number;
    pageSize: number;
    search: string;
  }): Promise<AdminUsersPage> {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = {
      deleted_at: null,
      ...(escaped
        ? {
            $or: [
              { name: { $regex: escaped, $options: 'i' } },
              { email: { $regex: escaped, $options: 'i' } },
            ],
          }
        : {}),
    };
    const since = new Date(Date.now() - 30 * 24 * 60 * 60_000);
    const [users, total, admins, totalUsers, regularUsers, newUsersLast30Days] =
      await Promise.all([
        this.db.User.find(filter)
          .select('_id name email role blocked created_at')
          .sort({ created_at: -1, _id: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        this.db.User.countDocuments(filter),
        this.db.User.countDocuments({ role: 'admin', deleted_at: null }),
        this.db.User.countDocuments({ deleted_at: null }),
        this.db.User.countDocuments({ role: 'user', deleted_at: null }),
        this.db.User.countDocuments({
          deleted_at: null,
          created_at: { $gte: since },
        }),
      ]);
    return {
      users: users.map((user) => ({
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        blocked: user.blocked ?? false,
        created_at: user.created_at,
      })),
      total,
      admins,
      totalUsers,
      regularUsers,
      newUsersLast30Days,
      page,
      pageSize,
    };
  }
}
