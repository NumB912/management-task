import { describe, expect, it } from 'vitest';
import { ChangePasswordUsecase } from './changePassword.usecase.js';

describe('changePassword.usecase', () => {
  it('should export ChangePasswordUsecase', () => {
    expect(ChangePasswordUsecase).toBeDefined();
  });
});
