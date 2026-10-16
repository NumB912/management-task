import { describe, expect, it } from 'vitest';
import { WorkSpaceUsecase } from './workspace.usecase.js';

describe('workspace.usecase', () => {
  it('should export WorkSpaceUsecase', () => {
    expect(WorkSpaceUsecase).toBeDefined();
  });
});
