import { ConfigService } from '@nestjs/config';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import { MongodbClient } from '@/infrastructure/repositories/database/mongoClient.Database.js';
import { DatabaseModels } from '@/infrastructure/repositories/database/clientSchema.database.js';

export const databaseProviders = [
  {
    provide: TYPES.DatabaseType,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const client = await MongodbClient.getInstance(
        config.getOrThrow<string>('MONGODB_URI'),
      );
      const databaseModels = await DatabaseModels.getInstance(
        client.getClient(),
      );
      return databaseModels;
    },
  },
];
