import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { CheckAccountStatusMiddleware } from './checkAccountStatus.middleware';
import { CheckAccountAccessUsecase } from '@/application/usecase/auth/checkAccountAccess.usecase';

describe('CheckAccountStatusMiddleware', () => {
  const id = '507f1f77bcf86cd799439011';
  const request = () => ({ user: { id } }) as unknown as Request;
  const create = (account: { blocked: boolean } | null) =>
    new CheckAccountStatusMiddleware(
      new CheckAccountAccessUsecase({
        findAccountAccess: vi.fn().mockResolvedValue(account),
      }),
    );
  it('denies a blocked account with HTTP 403 even when its token remains valid', async () => {
    const next = vi.fn();
    await expect(
      create({ blocked: true }).use(request(), {} as Response, next),
    ).rejects.toMatchObject({ status: 403, message: 'Tài khoản đã bị khóa' });
    expect(next).not.toHaveBeenCalled();
  });
  it('denies missing accounts and unauthenticated requests with HTTP 401', async () => {
    const next = vi.fn();
    await expect(
      create(null).use(request(), {} as Response, next),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      create({ blocked: false }).use({} as Request, {} as Response, next),
    ).rejects.toMatchObject({ status: 401 });
    expect(next).not.toHaveBeenCalled();
  });
  it('reads account status on each request so locking and unlocking take effect immediately', async () => {
    const findAccountAccess = vi
      .fn()
      .mockResolvedValueOnce({ blocked: false })
      .mockResolvedValueOnce({ blocked: true })
      .mockResolvedValueOnce({ blocked: false });
    const middleware = new CheckAccountStatusMiddleware(
      new CheckAccountAccessUsecase({ findAccountAccess }),
    );
    const next = vi.fn();
    await middleware.use(request(), {} as Response, next);
    await expect(
      middleware.use(request(), {} as Response, next),
    ).rejects.toMatchObject({ status: 403 });
    await middleware.use(request(), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(findAccountAccess).toHaveBeenCalledTimes(3);
  });
});
