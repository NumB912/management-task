import { describe, expect, it } from 'vitest';
import { LoginWithEmailUseCase } from './login.usecase.js';

describe('login.usecase', () => {
  it('should export LoginWithEmailUseCase', () => {
    expect(LoginWithEmailUseCase).toBeDefined();
  });
});
