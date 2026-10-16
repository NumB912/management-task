import { describe, expect, it } from 'vitest';
import { PutAvatarUsecase } from './avatarPut.usecase.js';

describe('avatarPut.usecase', () => {
  it('should export PutAvatarUsecase', () => {
    expect(PutAvatarUsecase).toBeDefined();
  });
});
