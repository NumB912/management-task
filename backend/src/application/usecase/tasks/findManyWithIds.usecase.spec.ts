import { describe, expect, it } from 'vitest';
import { GetAllTasksWithIdsUsecase } from './findManyWithIds.usecase.js';

describe('findManyWithIds.usecase', () => {
  it('should export GetAllTasksWithIdsUsecase', () => {
    expect(GetAllTasksWithIdsUsecase).toBeDefined();
  });
});
