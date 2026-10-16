import { describe, expect, it } from 'vitest';
import { CreateTaskUsecase } from './createTask.usecase.js';

describe('createTask.usecase', () => {
  it('should export CreateTaskUsecase', () => {
    expect(CreateTaskUsecase).toBeDefined();
  });
});
