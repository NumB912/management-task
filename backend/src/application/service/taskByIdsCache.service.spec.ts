import { describe, expect, it, vi } from 'vitest';
import type { ICache } from '@/domain';
import { TaskDetailByIdsCache } from './taskByIdsCache.service.js';

function setup() {
  const values = new Map<string, unknown>();
  const cache: ICache = {
    get: vi.fn(async (key: string) => values.get(key) ?? null) as ICache['get'],
    mget: vi.fn(async (keys: string[]) => keys.map((key) => values.get(key) ?? null)) as ICache['mget'],
    set: vi.fn(async (key, value) => { values.set(key, value); }),
    delete: vi.fn(async (key) => { values.delete(key); }),
  };
  return { cache, service: new TaskDetailByIdsCache(cache) };
}
const scope = { userId: 'u1', listId: 'l1' };

describe('TaskDetailByIdsCache', () => {
  it('fetches only missing IDs and preserves order and dates', async () => {
    const { service } = setup();
    const date = new Date();
    const database = vi.fn(async (ids: string[]) => ids.map((id) => ({ id, created_at: date })));
    await service.load(['a'], scope, database);
    expect(await service.load(['b', 'a', 'b'], scope, database)).toEqual([
      { id: 'b', created_at: date }, { id: 'a', created_at: date },
    ]);
    expect(database.mock.calls.map(([ids]) => ids)).toEqual([['a'], ['b']]);
    expect((await service.load(['a'], scope, database))[0].created_at).toBeInstanceOf(Date);
  });

  it('isolates users and reloads after version invalidation', async () => {
    const { service } = setup();
    const database = vi.fn(async (ids: string[]) => ids.map((id) => ({ id })));
    await service.load(['a'], scope, database);
    await service.load(['a'], { ...scope, userId: 'u2' }, database);
    await service.invalidate();
    await service.load(['a'], scope, database);
    expect(database).toHaveBeenCalledTimes(3);
  });

  it('handles empty lists, missing tasks, and Redis failure', async () => {
    const { service, cache } = setup();
    const database = vi.fn(async (_ids: string[]) => []);
    expect(await service.load([], scope, database)).toEqual([]);
    expect(database).not.toHaveBeenCalled();
    expect(await service.load(['missing'], scope, database)).toEqual([]);
    vi.mocked(cache.get).mockRejectedValue(new Error('offline'));
    expect(await service.load(['a'], scope, database)).toEqual([]);
    expect(database).toHaveBeenLastCalledWith(['a']);
  });
});
