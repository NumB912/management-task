import { describe, expect, it } from 'vitest';
import { RealtimeNotifier } from './notification.usecase.js';

describe('notification.usecase', () => {
  it('should export RealtimeNotifier', () => {
    expect(RealtimeNotifier).toBeDefined();
  });
});
