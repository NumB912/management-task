import { Controller, Get, Inject, Query, Req } from '@nestjs/common';
import type { AuthRequest } from '../common/types/authRequest.type.js';
import { StatisticsRepository } from '@/infrastructure/repositories/statistics.repository.js';
import {
  calculatePomodoroStatistics,
  calculateTaskStatistics,
  statisticsPeriod,
} from '@/application/service/statistics.service.js';

@Controller('statistics')
export class StatisticsController {
  constructor(
    @Inject(StatisticsRepository)
    private readonly repository: StatisticsRepository,
  ) {}

  @Get('tasks')
  async tasks(
    @Req() req: AuthRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const now = new Date();
    const period = statisticsPeriod(query, now);
    return {
      data: calculateTaskStatistics(
        await this.repository.tasks(req.user.id, period),
        period,
        now,
      ),
    };
  }

  @Get('pomodoro')
  async pomodoro(
    @Req() req: AuthRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const period = statisticsPeriod(query);
    return {
      data: calculatePomodoroStatistics(
        await this.repository.pomodoro(req.user.id, period),
        period,
      ),
    };
  }
}
