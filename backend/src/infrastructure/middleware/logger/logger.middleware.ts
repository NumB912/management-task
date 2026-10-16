import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    res.once('finish', () => {
      const message = `${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms ip=${req.ip ?? 'unknown'}`;
      if (res.statusCode >= 500) {
        this.logger.error(`${message} error=HTTP ${res.statusCode}`);
      } else if (res.statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });
    next();
  }
}
