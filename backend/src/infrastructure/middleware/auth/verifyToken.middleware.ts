import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface AuthUser extends JwtPayload {
  sub: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('SECRET_KEY'); // thiếu thì dừng ngay khi khởi động
  }

  use(req: Request, _res: Response, next: NextFunction) {
    delete req.user;

    const token = req.cookies?.['token'];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập')
    }

    try {
      const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      if (typeof payload === 'string') throw new Error('payload không hợp lệ');
      req.user = payload as AuthUser;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
      }
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}