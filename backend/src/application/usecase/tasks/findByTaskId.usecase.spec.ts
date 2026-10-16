import { describe, expect, it } from 'vitest';
import { GetTaskByIdUsecase } from './findByTaskId.usecase.js';

describe('findByTaskId.usecase', () => {
  it('should export GetTaskByIdUsecase', () => {
    expect(GetTaskByIdUsecase).toBeDefined();
  });
});
