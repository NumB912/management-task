import { describe, expect, it } from 'vitest';
import { SendChangePasswordUsecase } from './sendChangePassword.usecase.js';

describe('sendChangePassword.usecase', () => {
  it('should export SendChangePasswordUsecase', () => {
    expect(SendChangePasswordUsecase).toBeDefined();
  });
});
