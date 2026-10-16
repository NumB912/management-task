import { describe, expect, it } from 'vitest';
import { ReadedNotificationUsecase } from './readNotification.usecase.js';

describe('readNotification.usecase', () => {
  it('should export ReadedNotificationUsecase', () => {
    expect(ReadedNotificationUsecase).toBeDefined();
  });
});
