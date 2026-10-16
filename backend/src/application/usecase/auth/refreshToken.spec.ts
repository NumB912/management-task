import { describe, expect, it } from 'vitest';
import { RefreshTokenUseCase } from './refreshToken.js';

describe('refreshToken', () => {
  it('should export RefreshTokenUseCase', () => {
    expect(RefreshTokenUseCase).toBeDefined();
  });
});
