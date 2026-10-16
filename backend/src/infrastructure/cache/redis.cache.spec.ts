import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedisCache } from './redis.cache.js';

const client = vi.hoisted(() => ({
  isOpen: true,
  mGet: vi.fn(),
  on: vi.fn(),
}));
vi.mock('@redis/client', () => ({ createClient: () => client }));

describe('RedisCache.mget', () => {
  const cache = RedisCache.getInstance('redis://localhost:6379');
  beforeEach(() => vi.clearAllMocks());

  it('reads all keys in one call and preserves order, misses and duplicates', async () => {
    client.mGet.mockResolvedValue([
      '{"id":"task-5"}',
      null,
      '{"id":"task-1"}',
      '{"id":"task-5"}',
    ]);
    const keys = ['task:5', 'task:missing', 'task:1', 'task:5'];
    expect(await cache.mget<{ id: string }>(keys)).toEqual([
      { id: 'task-5' },
      null,
      { id: 'task-1' },
      { id: 'task-5' },
    ]);
    expect(client.mGet).toHaveBeenCalledExactlyOnceWith(keys);
  });

  it('returns an empty result without calling Redis for empty input', async () => {
    expect(await cache.mget([])).toEqual([]);
    expect(client.mGet).not.toHaveBeenCalled();
  });

  it('decodes arrays and falsy JSON values without treating them as misses', async () => {
    client.mGet.mockResolvedValue(['["task-1","task-2"]', '0', 'false', '""']);
    expect(await cache.mget(['ids', 'count', 'flag', 'text'])).toEqual([
      ['task-1', 'task-2'],
      0,
      false,
      '',
    ]);
  });

  it('propagates Redis errors so the caller can apply a database fallback', async () => {
    client.mGet.mockRejectedValue(new Error('Redis offline'));
    await expect(cache.mget(['task:1'])).rejects.toThrow('Redis offline');
  });
});
