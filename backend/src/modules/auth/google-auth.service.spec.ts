import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import jwt from 'jsonwebtoken';

function setup() {
  const config = new ConfigService({ SECRET_KEY: 'test-secret-only',
    GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3010/api/v1/auth/google/callback',
    APP_URL: 'http://localhost:3000' });
  const user = { id: 'user1', email: 'person@gmail.com', name: 'Person', role: 'user' };
  const users = { findById: vi.fn().mockResolvedValue(user), linkGoogle: vi.fn().mockResolvedValue(true), findOne: vi.fn().mockResolvedValue(user), findByEmailCaseInsensitive: vi.fn().mockResolvedValue(null) };
  const register = { execute: vi.fn() };
  const tokens = { generateToken: vi.fn().mockResolvedValue('app-token') };
  const cache = { set: vi.fn() };
  const service = new GoogleAuthService(config, users as never, register as never, tokens as never, cache as never);
  const start = service.start();
  const state = new URL(start.url).searchParams.get('state');
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'google-token' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ sub: 'google-sub', email: user.email, email_verified: true, name: user.name }) });
  vi.stubGlobal('fetch', fetchMock);
  return { service, users, register, tokens, cache, start, state, fetchMock, user };
}

afterEach(() => vi.unstubAllGlobals());

describe('Google authentication', () => {
  it('links Google to the authenticated account without creating a user or replacing tokens', async () => {
    const t = setup();
    const token = jwt.sign({ id: 'user1' }, 'test-secret-only', { expiresIn: '1h' });
    const start = await t.service.startLink(token);
    const state = new URL(start.url).searchParams.get('state');
    t.users.findOne.mockResolvedValueOnce(null);
    await expect(t.service.complete('code', state, start.context, token)).resolves.toEqual({ linked: true });
    expect(t.users.linkGoogle).toHaveBeenCalledWith('user1', 'google-sub');
    expect(t.register.execute).not.toHaveBeenCalled();
    expect(t.tokens.generateToken).not.toHaveBeenCalled();
  });
  it('requires an authenticated session to initiate linking', async () => {
    const t = setup();
    await expect(t.service.startLink(undefined)).rejects.toMatchObject({ status: 401 });
  });
  it('rejects linking when the browser session changed', async () => {
    const t = setup();
    const token = jwt.sign({ id: 'user1' }, 'test-secret-only');
    const start = await t.service.startLink(token);
    const other = jwt.sign({ id: 'user2' }, 'test-secret-only');
    await expect(t.service.complete('code', new URL(start.url).searchParams.get('state'), start.context, other)).rejects.toThrow('session');
    expect(t.fetchMock).not.toHaveBeenCalled();
  });
  it('rejects linking a different email', async () => {
    const t = setup();
    const token = jwt.sign({ id: 'user1' }, 'test-secret-only');
    const start = await t.service.startLink(token);
    t.users.findById.mockResolvedValueOnce({ ...t.user, email: 'other@gmail.com' });
    await expect(t.service.complete('code', new URL(start.url).searchParams.get('state'), start.context, token)).rejects.toMatchObject({ code: 'GOOGLE_EMAIL_MISMATCH' });
    expect(t.users.linkGoogle).not.toHaveBeenCalled();
  });
  it('rejects a Google identity already owned by another account', async () => {
    const t = setup();
    const token = jwt.sign({ id: 'user1' }, 'test-secret-only');
    const start = await t.service.startLink(token);
    t.users.findOne.mockResolvedValueOnce({ ...t.user, id: 'other' });
    await expect(t.service.complete('code', new URL(start.url).searchParams.get('state'), start.context, token)).rejects.toMatchObject({ code: 'GOOGLE_LINK_CONFLICT' });
    expect(t.users.linkGoogle).not.toHaveBeenCalled();
  });
  it('rejects mismatched state before contacting Google', async () => {
    const t = setup();
    await expect(t.service.complete('code', 'wrong', t.start.context)).rejects.toThrow('state');
    expect(t.fetchMock).not.toHaveBeenCalled();
  });
  it('rejects forged cookies and missing codes', async () => {
    const t = setup();
    await expect(t.service.complete('code', t.state, 'forged')).rejects.toThrow();
    await expect(t.service.complete(undefined, t.state, t.start.context)).rejects.toThrow();
    expect(t.tokens.generateToken).not.toHaveBeenCalled();
  });
  it('reuses the Google subject and issues existing application tokens', async () => {
    const t = setup();
    await expect(t.service.complete('code', t.state, t.start.context)).resolves.toEqual({ token: 'app-token', refresh_token: 'app-token' });
    expect(t.users.findOne).toHaveBeenCalledWith({ googleId: 'google-sub' });
    expect(t.register.execute).not.toHaveBeenCalled();
    expect(t.cache.set).toHaveBeenCalledWith('refreshToken:user1', 'app-token', 86400);
    expect(new URL(t.start.url).searchParams.get('code_challenge_method')).toBe('S256');
  });
  it('creates a new Google account through transactional registration', async () => {
    const t = setup();
    t.users.findOne.mockResolvedValueOnce(null);
    await t.service.complete('code', t.state, t.start.context);
    expect(t.register.execute).toHaveBeenCalledWith(expect.objectContaining({ googleId: 'google-sub', email: t.user.email }));
  });
  it('does not auto-link an existing email account', async () => {
    const t = setup();
    t.users.findOne.mockResolvedValueOnce(null);
    t.users.findByEmailCaseInsensitive.mockResolvedValueOnce(t.user);
    await expect(t.service.complete('code', t.state, t.start.context)).rejects.toMatchObject({ code: 'GOOGLE_EMAIL_EXISTS' });
    expect(t.register.execute).not.toHaveBeenCalled();
    expect(t.tokens.generateToken).not.toHaveBeenCalled();
  });
  it('rejects unverified Google email', async () => {
    const t = setup();
    t.fetchMock.mockReset().mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'google-token' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sub: 'sub', email: 'x@y.com', email_verified: false }) });
    await expect(t.service.complete('code', t.state, t.start.context)).rejects.toThrow('Unverified');
    expect(t.users.findOne).not.toHaveBeenCalled();
  });
  it('does not issue application tokens when Google rejects the code', async () => {
    const t = setup();
    t.fetchMock.mockReset().mockResolvedValueOnce({ ok: false });
    await expect(t.service.complete('code', t.state, t.start.context)).rejects.toThrow('exchange');
    expect(t.tokens.generateToken).not.toHaveBeenCalled();
  });
});
