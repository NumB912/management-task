import { ConfigService } from '@nestjs/config';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { RedisCache } from '@/infrastructure/cache/redis.cache.js';
import { TaskDetailCache } from '@/application/service/taskDetailCache.service.js';

export const cacheProviders = [
  {
    provide: TYPES.Cache,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const client = RedisCache.getInstance(
        config.getOrThrow<string>('REDIS_URI'),
      );
      return client;
    },
  },
  {
    provide: TaskDetailCache,
    inject: [TYPES.Cache],
    useFactory: (cache: RedisCache) => new TaskDetailCache(cache),
  },
];
