import { describe, expect, it } from 'vitest';
import { DeleteAvatarUsecase } from './avatarDel.usecase.js';

describe('avatarDel.usecase', () => {
  it('should export DeleteAvatarUsecase', () => {
    expect(DeleteAvatarUsecase).toBeDefined();
  });
});
