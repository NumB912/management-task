import { describe, expect, it } from 'vitest';
import { ConfirmOtpUsecase } from './confirm_otp.usecase.js';

describe('confirm_otp.usecase', () => {
  it('should export ConfirmOtpUsecase', () => {
    expect(ConfirmOtpUsecase).toBeDefined();
  });
});
