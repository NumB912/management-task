import { describe, expect, it } from 'vitest';
import { GetAllTagsUsecase } from './getAllTag.usecase.js';

describe('getAllTag.usecase', () => {
  it('should export GetAllTagsUsecase', () => {
    expect(GetAllTagsUsecase).toBeDefined();
  });
});
