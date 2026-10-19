import { AppError } from '@/domain/errors/appError.errors.js';
import type { AdminActivity, IAdminRepository } from '@/domain/repositories/IAdmin.repository.js';

export class GetAdminActivityUsecase {
  constructor(
    private readonly repository: Pick<IAdminRepository, 'findUser' | 'findActivity'>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: { days?: string; userId?: string }): Promise<AdminActivity> {
    const days = Number(input.days) === 7 ? 7 : Number(input.days) === 90 ? 90 : 30;
    if (input.userId !== undefined && !/^[a-f\d]{24}$/i.test(input.userId)) throw new AppError('BAD_REQUEST', 'ID người dùng không hợp lệ', 400);
    const user = input.userId ? await this.repository.findUser(input.userId) : null;
    if (input.userId && !user) throw new AppError('NOT_FOUND', 'Không tìm thấy người dùng', 404);
    const end = this.now();
    const dayMs = 86400000;
    const offsetMs = 7 * 3600000;
    const start = new Date(Math.floor((end.getTime() + offsetMs) / dayMs) * dayMs - offsetMs - (days - 1) * dayMs);
    const data = await this.repository.findActivity({ start, end, userId: input.userId });
    const daily = Array.from({ length: days }, (_, i) => {
      const date = new Date(start.getTime() + offsetMs + i * dayMs).toISOString().slice(0, 10);
      return data.daily.find(row => row.date === date) ?? { date, sessions: 0, activeUsers: 0 };
    });
    const hourly = Array.from({ length: 24 }, (_, hour) => data.hourly.find(row => row.hour === hour) ?? { hour, sessions: 0 });
    return { user, days, daily, hourly, summary: data.summary };
  }
}
