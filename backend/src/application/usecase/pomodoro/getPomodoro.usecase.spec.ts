import { describe, expect, it } from 'vitest';
import { GetPomodoroUsecase } from './getPomodoro.usecase.js';

describe('getPomodoro.usecase', () => {
  it('should export GetPomodoroUsecase', () => {
    expect(GetPomodoroUsecase).toBeDefined();
  });
});
