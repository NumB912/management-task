import { describe, expect, it } from 'vitest';
import { PutProfileUsecase } from './profileupdate.usecase.js';

describe('profileupdate.usecase', () => {
  it('should export PutProfileUsecase', () => {
    expect(PutProfileUsecase).toBeDefined();
  });
});
