import { describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { ColorRepository } from './color.repository.js';

describe('ColorRepository', () => {
  it('should be defined', () => {
    const db = { Color: {} } as any;
    const repo = new ColorRepository(db, {} as any);
    expect(repo).toBeDefined();
  });

  it('finds a color by ref', async () => {
    const doc = { _id: new Types.ObjectId() };
    const session = vi.fn().mockResolvedValue(doc);
    const findOne = vi.fn(() => ({ session }));
    const db = { Color: { findOne } } as any;
    const mapper = { toDomain: vi.fn((d: any) => d) } as any;
    const repo = new ColorRepository(db, mapper);

    const result = await repo.findByRef({
      type: 'list' as any,
      refId: '507f1f77bcf86cd799439011',
      user: '507f1f77bcf86cd799439012',
    });

    expect(findOne).toHaveBeenCalled();
    expect(mapper.toDomain).toHaveBeenCalled();
    expect(result).toBe(doc);
  });
});
