import { describe, expect, it } from 'vitest';
import { DeleteSectionUsecase } from './deleteSection.usecase.js';

describe('deleteSection.usecase', () => {
  it('should export DeleteSectionUsecase', () => {
    expect(DeleteSectionUsecase).toBeDefined();
  });
});
