import { TYPES } from '@/infrastructure/types/dependency.type.js';
import Publisher from '@/infrastructure/event/publisher.event.js';

export const messagingProviders = [
  {
    provide: TYPES.Publisher,
    useFactory: async () => await Publisher.create(),
  },
];
