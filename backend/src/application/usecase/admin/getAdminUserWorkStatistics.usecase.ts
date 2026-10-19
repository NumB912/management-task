import { AppError } from '@/domain/errors/appError.errors.js';
import type {
  AdminUserWorkStatistics,
  IAdminRepository,
} from '@/domain/repositories/IAdmin.repository.js';

export class GetAdminUserWorkStatisticsUsecase {
  constructor(
    private readonly repository: Pick<
      IAdminRepository,
      'findUser' | 'findUserWorkStatistics'
    >,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: {
    userId: string;
    days?: string;
  }): Promise<AdminUserWorkStatistics> {
    if (!/^[a-f\d]{24}$/i.test(input.userId))
      throw new AppError('BAD_REQUEST', 'ID người dùng không hợp lệ', 400);
    if (!(await this.repository.findUser(input.userId)))
      throw new AppError('NOT_FOUND', 'Không tìm thấy người dùng', 404);
    const days =
      Number(input.days) === 7 ? 7 : Number(input.days) === 90 ? 90 : 30;
    const end = this.now();
    const dayMs = 86400000;
    const offsetMs = 7 * 3600000;
    const start = new Date(
      Math.floor((end.getTime() + offsetMs) / dayMs) * dayMs -
        offsetMs -
        (days - 1) * dayMs,
    );
    const data = await this.repository.findUserWorkStatistics({
      userId: input.userId,
      start,
      end,
    });
    const daily = Array.from({ length: days }, (_, index) => {
      const date = new Date(start.getTime() + offsetMs + index * dayMs)
        .toISOString()
        .slice(0, 10);
      return (
        data.daily.find((row) => row.date === date) ?? {
          date,
          completedTasks: 0,
        }
      );
    });
    const completedTasks = daily.reduce(
      (sum, row) => sum + row.completedTasks,
      0,
    );
    return {
      totalLists: data.totalLists,
      totalTasks: data.totalTasks,
      days,
      daily,
      completedTasks,
      averageCompletedPerDay: Number((completedTasks / days).toFixed(2)),
    };
  }
}
