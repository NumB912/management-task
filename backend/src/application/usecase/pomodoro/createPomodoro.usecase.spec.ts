import { describe, expect, it } from 'vitest';
import { CreatePomodoroUsecase } from './createPomodoro.usecase.js';

describe('createPomodoro.usecase', () => {
  it('should export CreatePomodoroUsecase', () => {
    expect(CreatePomodoroUsecase).toBeDefined();
  });
});
