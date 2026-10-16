import { describe, expect, it, vi } from 'vitest';
import { lastValueFrom, of, throwError } from 'rxjs';
import type { ExecutionContext } from '@nestjs/common';
import { TaskCacheInterceptor } from './taskCache.interceptor.js';
import { TaskDetailCache } from '@/application/service/taskDetailCache.service.js';

describe('TaskCacheInterceptor', () => {
  const context = (method: string) => ({
    switchToHttp: () => ({ getRequest: () => ({ method }) }),
  }) as unknown as ExecutionContext;

  it('leaves GET cache entries valid', async () => {
    const invalidate = vi.fn();
    const interceptor = new TaskCacheInterceptor({ invalidate } as unknown as TaskDetailCache);
    expect(await lastValueFrom(interceptor.intercept(context('GET'), { handle: () => of('task') }))).toBe('task');
    expect(invalidate).not.toHaveBeenCalled();
  });

  it.each(['POST', 'PATCH', 'DELETE'])('invalidates after %s completes', async (method) => {
    const invalidate = vi.fn(async () => {});
    const interceptor = new TaskCacheInterceptor({ invalidate } as unknown as TaskDetailCache);
    expect(await lastValueFrom(interceptor.intercept(context(method), { handle: () => of('ok') }))).toBe('ok');
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('invalidates partial writes on failure without hiding the error', async () => {
    const invalidate = vi.fn(async () => {});
    const interceptor = new TaskCacheInterceptor({ invalidate } as unknown as TaskDetailCache);
    const error = new Error('write failed');
    await expect(lastValueFrom(interceptor.intercept(context('PATCH'), { handle: () => throwError(() => error) }))).rejects.toBe(error);
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
