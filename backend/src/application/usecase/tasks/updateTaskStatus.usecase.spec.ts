import { describe, expect, it, vi } from 'vitest';
import { UpdateStatusUsecase } from './updateTaskStatus.usecase.js';

describe('UpdateStatusUsecase transaction retry', () => {
  it('retries the full transaction after a Mongo write conflict', async () => {
    const conflict = Object.assign(new Error('Write conflict'), { code: 112 });
    const taskRepository = {
      findManyPopulateByIds: vi.fn().mockResolvedValue([
        { id: 'task-1', list: 'list-1' },
      ]),
      updateMany: vi
        .fn()
        .mockRejectedValueOnce(conflict)
        .mockResolvedValueOnce(true),
    };
    const unitWork = {
      startTransaction: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockResolvedValue({}),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollBackTransaction: vi.fn().mockResolvedValue(undefined),
    };
    const listRepository = {
      findById: vi.fn().mockResolvedValue({ isShareList: false }),
    };
    const usecase = new UpdateStatusUsecase(
      taskRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      listRepository as any,
      {} as any,
      {} as any,
      unitWork as any,
    );

    await expect(
      usecase.execute({
        userId: 'user-1',
        data: [{ id: 'task-1', status: 'done', type: 'single' }],
      }),
    ).resolves.toBeUndefined();

    expect(unitWork.startTransaction).toHaveBeenCalledTimes(2);
    expect(unitWork.rollBackTransaction).toHaveBeenCalledTimes(1);
    expect(taskRepository.updateMany).toHaveBeenCalledTimes(2);
    expect(unitWork.commitTransaction).toHaveBeenCalledTimes(1);
  });
});
