import { describe, expect, it } from 'vitest';
import { ExitMemberUsecase } from './exit.usecase.js';

describe('exit.usecase', () => {
  it('should export ExitMemberUsecase', () => {
    expect(ExitMemberUsecase).toBeDefined();
  });
});
