import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { pomodoroRepository } from './pomodoro.repository.js';

describe('pomodoroRepository', () => {
  it('should be defined', () => {
    const db = { pomodoro: {} } as any;
    const repo = new pomodoroRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('updates task in pomodoro', async () => {
    const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    const db = { pomodoro: { updateOne } } as any;
    const repo = new pomodoroRepository(db, {} as any);

    const result = await repo.updateTaskToPomodoro({
      userId: '507f1f77bcf86cd799439011',
      task: '507f1f77bcf86cd799439012',
      id: '507f1f77bcf86cd799439013',
    });

    expect(updateOne).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
