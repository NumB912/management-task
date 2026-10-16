import { describe, expect, it } from 'vitest';
import { GetAllTasksUsecase } from './findAllTask.usecase.js';

describe('findAllTask.usecase', () => {
  it('should export GetAllTasksUsecase', () => {
    expect(GetAllTasksUsecase).toBeDefined();
  });
});
