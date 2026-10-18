import { Controller, Get, Post, Logger, Req, Res, ForbiddenException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthService } from '../google-auth.service';
import { setLoginCookies } from '../login-cookies';

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, path: '/api/v1/auth/google' };

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);
  constructor(private readonly google: GoogleAuthService) {}

  @Post('link')
  async link(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.is('application/json')) throw new ForbiddenException('Expected JSON request');
    const { url, context } = await this.google.startLink(req.cookies?.token);
    res.setHeader('Cache-Control', 'no-store');
    res.cookie('google_oauth', context, { ...cookieOptions, maxAge: 600000 });
    return { url };
  }

  @Get()
  start(@Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const { url, context } = this.google.start();
      res.cookie('google_oauth', context, { ...cookieOptions, maxAge: 600000 });
      return res.redirect(url);
    } catch {
      this.logger.warn('Google OAuth configuration is missing or invalid');
      return res.redirect(this.google.frontend('/auth/login?google_error=unavailable'));
    }
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    res.clearCookie('google_oauth', cookieOptions);
    const linking = this.google.isLinkContext(req.cookies?.google_oauth);
    try {
      const result = await this.google.complete(req.query.code, req.query.state, req.cookies?.google_oauth, req.cookies?.token);
      if ('linked' in result) return res.redirect(this.google.frontend('/dashboard?google_link=success'));
      setLoginCookies(res, result);
      return res.redirect(this.google.frontend('/dashboard'));
    } catch (error) {
      if (linking) {
        const mismatch = error instanceof Error && 'code' in error && error.code === 'GOOGLE_EMAIL_MISMATCH';
        return res.redirect(this.google.frontend(`/dashboard?google_link=${mismatch ? 'email_mismatch' : 'failed'}`));
      }
      const exists = error instanceof Error && 'code' in error && error.code === 'GOOGLE_EMAIL_EXISTS';
      this.logger.warn('Google sign-in failed');
      return res.redirect(this.google.frontend(`/auth/login?google_error=${exists ? 'email_exists' : 'failed'}`));
    }
  }
}
