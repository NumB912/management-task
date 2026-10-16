import { describe, expect, it, vi } from 'vitest';
import type { ICache, ITask } from '@/domain';
import { TaskDetailCache } from './taskDetailCache.service.js';

function setup() {
  const values = new Map<string, unknown>();
  const cache: ICache = {
    get: vi.fn(async (key: string) => values.get(key) ?? null) as ICache['get'],
    mget: vi.fn(async (keys: string[]) => keys.map((key) => values.get(key) ?? null)) as ICache['mget'],
    set: vi.fn(async (key, value) => { values.set(key, JSON.parse(JSON.stringify(value))); }),
    delete: vi.fn(async (key) => { values.delete(key); }),
  };
  return { values, cache, service: new TaskDetailCache(cache) };
}

describe('TaskDetailCache', () => {
  it('reads database once, caches task:id with TTL, and preserves dates on a hit', async () => {
    const { cache, service } = setup();
    const task = { id: 'a', name: 'Task', created_at: new Date() };
    const database = vi.fn(async () => task);
    expect(await service.load('a', database)).toEqual(task);
    const cached = await service.load('a', database);
    expect(cached).toEqual(task);
    expect(cached?.created_at).toBeInstanceOf(Date);
    expect(database).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith('task:a', expect.any(Object), 60);
  });

  it('does not cache tasks that do not exist', async () => {
    const { service, values } = setup();
    expect(await service.load('missing', async () => null)).toBeNull();
    expect(values.has('task:missing')).toBe(false);
  });

  it('falls back to database on Redis read errors', async () => {
    const { service, cache } = setup();
    vi.mocked(cache.get).mockRejectedValue(new Error('Redis offline'));
    const database = vi.fn(async () => ({ id: 'a' }));
    expect(await service.load('a', database)).toEqual({ id: 'a' });
    expect(database).toHaveBeenCalledTimes(1);
  });

  it('returns database data when cache population fails', async () => {
    const { service, cache, values } = setup();
    values.set('task:cache-version', 'v1');
    vi.mocked(cache.set).mockRejectedValue(new Error('Redis offline'));
    expect(await service.load('a', async () => ({ id: 'a' }))).toEqual({ id: 'a' });
  });

  it('reloads after a mutation invalidates the shared version', async () => {
    const { service } = setup();
    await service.load('a', async () => ({ id: 'a', name: 'old' }));
    await service.invalidate();
    const database = vi.fn(async () => ({ id: 'a', name: 'new' }));
    expect(await service.load('a', database)).toEqual({ id: 'a', name: 'new' });
    expect(database).toHaveBeenCalledTimes(1);
  });

  it('does not accept a stale cache fill that completes after invalidation', async () => {
    const { service } = setup();
    let finish!: (task: Partial<ITask>) => void;
    let started!: () => void;
    const reading = new Promise<void>((resolve) => { started = resolve; });
    const pending = service.load('a', () => {
      started();
      return new Promise((resolve) => { finish = resolve; });
    });
    await reading;
    await service.invalidate();
    finish({ id: 'a', name: 'old' });
    await pending;
    const database = vi.fn(async () => ({ id: 'a', name: 'new' }));
    expect(await service.load('a', database)).toEqual({ id: 'a', name: 'new' });
    expect(database).toHaveBeenCalledTimes(1);
  });

  it('falls back within a bounded time when Redis does not respond', async () => {
    vi.useFakeTimers();
    try {
      const { service, cache } = setup();
      vi.mocked(cache.get).mockImplementation(() => new Promise(() => {}));
      const pending = service.load('a', async () => ({ id: 'a' }));
      await vi.advanceTimersByTimeAsync(250);
      expect(await pending).toEqual({ id: 'a' });
    } finally { vi.useRealTimers(); }
  });
});
