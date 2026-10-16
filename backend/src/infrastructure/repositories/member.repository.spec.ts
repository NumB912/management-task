import { describe, expect, it, vi } from 'vitest';
import { MemberRepository } from './member.repository.js';

describe('MemberRepository', () => {
  it('should be defined', () => {
    const db = { Member: {}, List: {} } as any;
    const repo = new MemberRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('checks existing members', async () => {
    const session = vi.fn().mockResolvedValue([{ email: 'a@test.com' }]);
    const find = vi.fn(() => ({ session }));
    const db = { Member: { find }, List: {} } as any;
    const repo = new MemberRepository(db, {} as any);
    const result = await repo.checkMembersIsExist(['a@test.com'], 'list1');
    expect(find).toHaveBeenCalled();
    expect(result).toEqual(['a@test.com']);
  });
});
