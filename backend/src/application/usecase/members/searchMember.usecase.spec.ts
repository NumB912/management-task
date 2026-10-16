import { describe, expect, it } from 'vitest';
import { SearchMemberUsecase } from './searchMember.usecase.js';

describe('searchMember.usecase', () => {
  it('should export SearchMemberUsecase', () => {
    expect(SearchMemberUsecase).toBeDefined();
  });
});
