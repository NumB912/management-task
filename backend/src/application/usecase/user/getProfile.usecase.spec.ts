import { describe, expect, it } from 'vitest';
import { GetProfileUsecase } from './getProfile.usecase.js';

describe('getProfile.usecase', () => {
  it('should export GetProfileUsecase', () => {
    expect(GetProfileUsecase).toBeDefined();
  });
});
