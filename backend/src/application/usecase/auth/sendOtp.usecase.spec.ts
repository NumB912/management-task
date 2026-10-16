import { describe, expect, it } from 'vitest';
import { SendOtpUsecase } from './sendOtp.usecase.js';

describe('sendOtp.usecase', () => {
  it('should export SendOtpUsecase', () => {
    expect(SendOtpUsecase).toBeDefined();
  });
});
