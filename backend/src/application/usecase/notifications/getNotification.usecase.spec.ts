import { describe, expect, it } from 'vitest';
import { GetNotificationsUsecase } from './getNotification.usecase.js';

describe('getNotification.usecase', () => {
  it('should export GetNotificationsUsecase', () => {
    expect(GetNotificationsUsecase).toBeDefined();
  });
});
