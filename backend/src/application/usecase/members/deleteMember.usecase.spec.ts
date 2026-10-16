import { describe, expect, it } from 'vitest';
import { DeleteMemberUsecase } from './deleteMember.usecase.js';

describe('deleteMember.usecase', () => {
  it('should export DeleteMemberUsecase', () => {
    expect(DeleteMemberUsecase).toBeDefined();
  });
});
