import { describe, expect, it } from 'vitest';
import { InviteMemberUsecase } from './inviteMember.usecase.js';

describe('inviteMember.usecase', () => {
  it('should export InviteMemberUsecase', () => {
    expect(InviteMemberUsecase).toBeDefined();
  });
});
