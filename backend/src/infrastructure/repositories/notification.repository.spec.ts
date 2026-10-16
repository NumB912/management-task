import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { NotificationRepository } from './notification.repository.js';

describe('NotificationRepository', () => {
  it('should be defined', () => {
    const db = { Notification: {} } as any;
    const repo = new NotificationRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('updates invite member notification status', async () => {
    const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    const db = { Notification: { updateOne } } as any;
    const repo = new NotificationRepository(db, {} as any);

    const result = await repo.updateNotificationInviteMemberStatus({
      listId: 'list1',
      userId: '507f1f77bcf86cd799439011',
      status: 'accept' as any,
    });

    expect(updateOne).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
