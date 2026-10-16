import { describe, expect, it } from 'vitest';
import { DeletePomodoroUsecase } from './deletePomodoro.usecase.js';

describe('deletePomodoro.usecase', () => {
  it('should export DeletePomodoroUsecase', () => {
    expect(DeletePomodoroUsecase).toBeDefined();
  });
});
