import { Module } from '@nestjs/common';
import { AuthController } from './http/auth.controller.js';

@Module({
  controllers: [AuthController],
  imports: [],
  providers: [],
})
export class AuthModule {}
