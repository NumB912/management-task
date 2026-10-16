import { describe, expect, it } from 'vitest';
import { RegisterEmailUsecase } from './register.usecase.js';

describe('register.usecase', () => {
  it('should export RegisterEmailUsecase', () => {
    expect(RegisterEmailUsecase).toBeDefined();
  });
});
