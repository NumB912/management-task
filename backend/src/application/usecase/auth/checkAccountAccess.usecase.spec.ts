import { describe, expect, it, vi } from 'vitest';
import { CheckAccountAccessUsecase } from './checkAccountAccess.usecase';

describe('CheckAccountAccessUsecase', () => {
  it('rejects invalid identities without reading persistence', async () => {
    const findAccountAccess = vi.fn();
    const usecase = new CheckAccountAccessUsecase({ findAccountAccess });
    expect(await usecase.execute(undefined)).toBe('missing');
    expect(await usecase.execute('invalid')).toBe('missing');
    expect(findAccountAccess).not.toHaveBeenCalled();
  });

  it('distinguishes missing, blocked and active accounts', async () => {
    const findAccountAccess = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ blocked: true }).mockResolvedValueOnce({ blocked: false });
    const usecase = new CheckAccountAccessUsecase({ findAccountAccess });
    const id = '507f1f77bcf86cd799439011';
    expect(await usecase.execute(id)).toBe('missing');
    expect(await usecase.execute(id)).toBe('blocked');
    expect(await usecase.execute(id)).toBe('active');
  });
});
