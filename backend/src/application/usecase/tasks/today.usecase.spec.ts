import { describe, expect, it } from 'vitest';
import { GetTodayUsecase } from './today.usecase.js';

describe('today.usecase', () => {
  it('should export GetTodayUsecase', () => {
    expect(GetTodayUsecase).toBeDefined();
  });
});
