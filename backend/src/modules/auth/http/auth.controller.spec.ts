import { describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller';

function setup() {
  const login = { execute: vi.fn() };
  const unused = { execute: vi.fn() };
  const controller = new AuthController(
    login as never, unused as never, unused as never, unused as never,
    unused as never, unused as never, unused as never, unused as never,
    new ConfigService(),
  );
  const cookie = vi.fn();
  const response = { cookie } as unknown as Response;
  const dto = { email: 'user@example.test', password: 'test-password' };
  return { controller, login, cookie, response, dto };
}

describe('AuthController.login', () => {
  it.each([
    undefined,
    null,
    {},
    { token: 'access' },
    { refresh_token: 'refresh' },
    { token: undefined, refresh_token: 'refresh' },
    { token: 'access', refresh_token: undefined },
    { token: null, refresh_token: 'refresh' },
    { token: 'access', refresh_token: null },
    { token: '', refresh_token: 'refresh' },
    { token: 'access', refresh_token: '' },
  ])('rejects an incomplete login result (%j) without setting cookies', async (result) => {
    const t = setup();
    t.login.execute.mockResolvedValue(result);
    await expect(t.controller.login(t.dto, t.response)).rejects.toMatchObject({
      code: 'NOT_FOUND', status: 500,
    });
    expect(t.cookie).not.toHaveBeenCalled();
  });

  it('sets both cookies after a successful login', async () => {
    const t = setup();
    t.login.execute.mockResolvedValue({ token: 'access', refresh_token: 'refresh' });
    await expect(t.controller.login(t.dto, t.response)).resolves.toEqual({ message: 'Đăng nhập thành công' });
    expect(t.login.execute).toHaveBeenCalledWith(t.dto);
    expect(t.cookie).toHaveBeenCalledTimes(2);
    expect(t.cookie).toHaveBeenCalledWith('token', 'access', expect.objectContaining({ httpOnly: true }));
    expect(t.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.objectContaining({ httpOnly: true }));
  });

  it('propagates authentication errors without setting cookies', async () => {
    const t = setup();
    const error = new Error('Invalid credentials');
    t.login.execute.mockRejectedValue(error);
    await expect(t.controller.login(t.dto, t.response)).rejects.toBe(error);
    expect(t.cookie).not.toHaveBeenCalled();
  });
});
