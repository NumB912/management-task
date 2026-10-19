import { SecurityModule } from '@/modules/security/security.module.js';
import { PersistenceModule } from '@/modules/platform/persistence.module.js';
import { CacheModule } from '@/modules/platform/cache.module.js';
import { ListsModule } from '@/modules/lists/lists.module.js';
import { MessagingModule } from '@/modules/platform/messaging.module.js';
import { authProviders } from './auth.providers.js';
import { Module } from '@nestjs/common';
import { AuthController } from './http/auth.controller.js';
import { GoogleAuthController } from './http/google-auth.controller';
import { GoogleAuthService } from './google-auth.service';

@Module({
  controllers: [AuthController, GoogleAuthController],
  imports: [
    SecurityModule,
    PersistenceModule,
    CacheModule,
    ListsModule,
    MessagingModule,
  ],
  providers: [GoogleAuthService, ...authProviders],
})
export class AuthModule {}
