
import { AppError } from '@/domain';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(AppError)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.status;
    const message = exception.message??"Không xác định"
    const code = exception.code??"INTERNAL"
    const logMessage = `${request.method} ${request.path} ${status} ${code}: ${message}`;
    if (status >= 500) this.logger.error(logMessage);
    else this.logger.warn(logMessage);

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:message,
        code:code
      });
  }
}
