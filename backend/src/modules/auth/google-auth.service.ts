import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  AppError,
  type ICache,
  type ITokenService,
  type IUserRepository,
} from '@/domain';
import { TYPES } from '@/infrastructure/types/dependency.type';
import { RegisterEmailUsecase } from '@/application/usecase/auth/register.usecase';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject(TYPES.UserRepository) private readonly users: IUserRepository,
    @Inject(TYPES.RegisterEmailUsecase)
    private readonly register: RegisterEmailUsecase,
    @Inject(TYPES.TokenService) private readonly tokens: ITokenService,
    @Inject(TYPES.Cache) private readonly cache: ICache,
  ) {}

  frontend(path: string) {
    return new URL(path, this.config.getOrThrow<string>('APP_URL')).toString();
  }

  async startLink(token: unknown) {
    const userId = this.sessionUser(token);
    const user = await this.users.findById(userId);
    if (!user || user.deleted_at) throw new AppError('UNAUTHORIZED', 'Vui lòng đăng nhập lại', 401);
    if (user.googleId) throw new AppError('CONFLICT', 'Tài khoản đã liên kết Google', 409);
    return this.start({ userId, sessionHash: createHash('sha256').update(token as string).digest('hex') });
  }

  private sessionUser(token: unknown): string {
    try {
      if (typeof token !== 'string') throw new Error();
      const payload = jwt.verify(token, this.config.getOrThrow<string>('SECRET_KEY'), { algorithms: ['HS256'] });
      if (typeof payload === 'string' || typeof payload.id !== 'string') throw new Error();
      return payload.id;
    } catch {
      throw new AppError('UNAUTHORIZED', 'Vui lòng đăng nhập lại', 401);
    }
  }

  isLinkContext(context: unknown): boolean {
    try {
      if (typeof context !== 'string') return false;
      const payload = jwt.verify(context, this.config.getOrThrow<string>('SECRET_KEY'), { algorithms: ['HS256'] });
      return typeof payload !== 'string' && payload.purpose === 'google-link';
    } catch { return false; }
  }

  start(link?: { userId: string; sessionHash: string }) {
    const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const context = jwt.sign(
      { state, verifier, purpose: link ? 'google-link' : 'google-login', ...link },
      this.config.getOrThrow<string>('SECRET_KEY'),
      { expiresIn: '10m' },
    );
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    return { url: url.toString(), context };
  }

  async complete(code: unknown, state: unknown, context: unknown, sessionToken?: unknown) {

    if (typeof code !== 'string' || !code) {
      throw new AppError('GOOGLE_CODE_MISSING', 'Google callback thiếu authorization code', 400);
    }
    if (typeof state !== 'string' || !state) {
      throw new AppError('GOOGLE_STATE_MISSING', 'Google callback thiếu state', 400);
    }
    if (typeof context !== 'string' || !context) {
      throw new AppError('GOOGLE_CONTEXT_MISSING', 'Không nhận được cookie phiên đăng nhập Google', 400);
    }
    const payload = jwt.verify(
      context,
      this.config.getOrThrow<string>('SECRET_KEY'),
      { algorithms: ['HS256'] },
    );
    if (
      typeof payload === 'string' ||
      !['google-login', 'google-link'].includes(payload.purpose) ||
      payload.state !== state ||
      typeof payload.verifier !== 'string'
    ) {
      throw new Error('Invalid OAuth state');
    }
    if (payload.purpose === 'google-link') {
      const userId = this.sessionUser(sessionToken);
      if (payload.userId !== userId || payload.sessionHash !== createHash('sha256').update(sessionToken as string).digest('hex')) {
        throw new Error('Link session changed');
      }
    }
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
        code_verifier: payload.verifier,
      }),
    });
    if (!response.ok) throw new Error('Google code exchange failed');
    const token = (await response.json()) as { access_token?: string };
    if (!token.access_token) throw new Error('Missing Google access token');
    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!profileResponse.ok) throw new Error('Google profile request failed');
    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    if (
      typeof profile.sub !== 'string' ||
      !profile.sub ||
      typeof profile.email !== 'string' ||
      !profile.email ||
      profile.email_verified !== true
    ) {
      throw new Error('Unverified Google identity');
    }
    if (payload.purpose === 'google-link') {
      const current = await this.users.findById(payload.userId);
      if (!current || current.deleted_at) throw new Error('Account unavailable');
      if (current.email.trim().toLowerCase() !== profile.email.trim().toLowerCase()) {
        throw new AppError('GOOGLE_EMAIL_MISMATCH', 'Hãy chọn Google có cùng email với hồ sơ', 409);
      }
      const owner = await this.users.findOne({ googleId: profile.sub });
      if (owner && owner.id !== current.id) throw new AppError('GOOGLE_LINK_CONFLICT', 'Google đã liên kết tài khoản khác', 409);
      if (current.googleId === profile.sub) return { linked: true as const };
      try {
        if (current.googleId || !await this.users.linkGoogle(current.id, profile.sub)) throw new Error('Conflict');
      } catch {
        throw new AppError('GOOGLE_LINK_CONFLICT', 'Không thể liên kết Google này', 409);
      }
      return { linked: true as const };
    }
    let user = await this.users.findOne({ googleId: profile.sub });
    if (!user) {
      const email = profile.email.trim().toLowerCase();

      if (await this.users.findByEmailCaseInsensitive(email)) {
        throw new AppError(
          'GOOGLE_EMAIL_EXISTS',
          'Email đã có tài khoản. Hãy đăng nhập bằng mật khẩu.',
          409,
        );
      }

      await this.register.execute({
        email,
        googleId: profile.sub,
        name: typeof profile.name === 'string' ? profile.name : email,
        password: randomBytes(48).toString('base64url'),
      });
      user = await this.users.findOne({ googleId: profile.sub });
    }
    if (!user || user.deleted_at) throw new Error('Account unavailable');
    const claims = { id: user.id, role: user.role, email: user.email };
    const refresh_token = await this.tokens.generateToken(claims, '1d');
    await this.cache.set(`refreshToken:${user.id}`, refresh_token, 86400);
    return {
      token: await this.tokens.generateToken(
        { ...claims, name: user.name },
        '1h',
      ),
      refresh_token,
    };
  }
}
