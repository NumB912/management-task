import { ArgumentsHost, Catch, HttpException, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler.js';

@Injectable()
@Catch(HttpException)
export class ExceptionsService extends BaseExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        
    }
}
