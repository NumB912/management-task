import { describe, expect, it } from 'vitest';
import { GetUpcomingUsecase } from './upComming.usecase.js';

describe('upComming.usecase', () => {
  it('should export GetUpcomingUsecase', () => {
    expect(GetUpcomingUsecase).toBeDefined();
  });
});
