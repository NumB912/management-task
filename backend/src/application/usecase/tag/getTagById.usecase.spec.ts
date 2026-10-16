import { describe, expect, it } from 'vitest';
import { GetTagByIdUsecase } from './getTagById.usecase.js';

describe('getTagById.usecase', () => {
  it('should export GetTagByIdUsecase', () => {
    expect(GetTagByIdUsecase).toBeDefined();
  });
});
