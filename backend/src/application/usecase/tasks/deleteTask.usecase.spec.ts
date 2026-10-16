import { describe, expect, it } from 'vitest';
import { DeleteTaskUsecase } from './deleteTask.usecase.js';

describe('deleteTask.usecase', () => {
  it('should export DeleteTaskUsecase', () => {
    expect(DeleteTaskUsecase).toBeDefined();
  });
});
