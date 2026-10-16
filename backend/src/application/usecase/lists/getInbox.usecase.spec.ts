import { describe, expect, it } from 'vitest';
import { GetInboxUsecase } from './getInbox.usecase.js';

describe('getInbox.usecase', () => {
  it('should export GetInboxUsecase', () => {
    expect(GetInboxUsecase).toBeDefined();
  });
});
