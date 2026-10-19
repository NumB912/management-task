import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { VerifyTokenMiddleware } from './verifyToken.middleware';

describe('VerifyTokenMiddleware', () => {
  const secret = 'test-secret';
  const middleware = new VerifyTokenMiddleware({
    getOrThrow: () => secret,
  } as unknown as ConfigService);
  it('verifies the token before passing the identity to the next middleware', () => {
    const req = {
      cookies: { token: jwt.sign({ id: '507f1f77bcf86cd799439011' }, secret) },
    } as unknown as Request;
    const next = vi.fn();
    middleware.use(req, {} as Response, next);
    expect(req.user?.id).toBe('507f1f77bcf86cd799439011');
    expect(next).toHaveBeenCalledOnce();
  });
  it.each([
    undefined,
    'invalid',
    jwt.sign({ id: 'user' }, 'wrong-secret'),
    jwt.sign({ id: 'user' }, secret, { expiresIn: -1 }),
  ])('rejects missing, forged and expired tokens', (token) => {
    const next = vi.fn();
    const req = {
      cookies: { token },
      user: { id: 'untrusted' },
    } as unknown as Request;
    expect(() => middleware.use(req, {} as Response, next)).toThrow();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
});
