import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, concatMap } from 'rxjs';
import { TaskDetailCache } from '@/application/service/taskDetailCache.service.js';

export class TaskCacheInterceptor implements NestInterceptor {
  constructor(private readonly cache: TaskDetailCache) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const { method } = context.switchToHttp().getRequest<{ method: string }>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next.handle();

    return next.handle().pipe(
      concatMap(async (result: unknown) => {
        await this.cache.invalidate();
        return result;
      }),
      catchError(async (error: unknown) => {
        await this.cache.invalidate();
        throw error;
      }),
    );
  }
}
