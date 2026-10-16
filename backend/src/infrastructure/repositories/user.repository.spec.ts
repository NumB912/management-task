import { describe, expect, it, vi } from 'vitest';
import { UserRepository } from './user.repository.js';

describe('UserRepository', () => {
  it('should be defined', () => {
    const db = { User: {} } as any;
    const repo = new UserRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('searches by email', async () => {
    const find = vi.fn().mockResolvedValue([{ email: 'a@test.com' }]);
    const db = { User: { find } } as any;
    const mapper = { toDomainWithoutPassword: vi.fn((d: any) => d) } as any;
    const repo = new UserRepository(db, mapper);

    const result = await repo.searchByEmail('a@test.com');

    expect(find).toHaveBeenCalled();
    expect(mapper.toDomainWithoutPassword).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});
