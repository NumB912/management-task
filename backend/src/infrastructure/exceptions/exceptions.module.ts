import { Module } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service.js';

@Module({
  providers: [ExceptionsService]
})
export class ExceptionsModule {}
