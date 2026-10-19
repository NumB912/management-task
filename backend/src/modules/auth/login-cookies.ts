import type { Response } from 'express';

export function setLoginCookies(res: Response, tokens: { token: string; refresh_token: string }) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' as const };
  res.cookie('token', tokens.token, { ...options, path: '/', maxAge: 3600000 });
  res.cookie('refresh_token', tokens.refresh_token, {
    ...options, path: '/api/v1/auth/refresh', maxAge: 86400000,
  });
}
