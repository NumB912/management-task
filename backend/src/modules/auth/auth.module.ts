import { Module } from '@nestjs/common';
import { AuthController } from './http/auth.controller.js';
import { GoogleAuthController } from './http/google-auth.controller';
import { GoogleAuthService } from './google-auth.service';

@Module({
  controllers: [AuthController, GoogleAuthController],
  imports: [],
  providers: [GoogleAuthService],
})
export class AuthModule {}
