import { describe, expect, it } from 'vitest';
import { LogoutUseCase } from './logout.usecase.js';

describe('logout.usecase', () => {
  it('should export LogoutUseCase', () => {
    expect(LogoutUseCase).toBeDefined();
  });
});
