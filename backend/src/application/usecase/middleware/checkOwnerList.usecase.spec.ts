import { describe, expect, it } from 'vitest';
import { CheckOwnerUsecase } from './checkOwnerList.usecase.js';

describe('checkOwnerList.usecase', () => {
  it('should export CheckOwnerUsecase', () => {
    expect(CheckOwnerUsecase).toBeDefined();
  });
});
