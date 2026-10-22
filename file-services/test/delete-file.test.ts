import { afterEach, describe, expect, it, vi } from 'vitest';
import DeleteFileEvent from '../src/application/event/deleteFile.event.js';
import type { IStorageService } from '../src/domain/service/IStorageService.js';
import type IConsumer from '../src/domain/message/consumer.message.js';
import { AppError } from '../src/domain/errors/AppError.js';

function setup() {
  const storage = {
    upload: vi.fn<IStorageService['upload']>(),
    listKeys: vi.fn<IStorageService['listKeys']>(),
    deleteMany: vi.fn<IStorageService['deleteMany']>(),
    delete: vi.fn<IStorageService['delete']>().mockResolvedValue(undefined),
    getDownloadUrl: vi.fn<IStorageService['getDownloadUrl']>(),
    getPublicUrl: vi.fn<IStorageService['getPublicUrl']>(),
  } satisfies IStorageService;
  let deliver!: (event: { fileName: string; userId: string }) => Promise<void>;
  const consumer = {
    sub: vi.fn<IConsumer['sub']>().mockImplementation(async (_exchange, _queue, _keys, _type, callback) => {
      deliver = callback;
    }),
    subBuffer: vi.fn<IConsumer['subBuffer']>(),
    close: vi.fn<IConsumer['close']>(),
  } satisfies IConsumer;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  return {
    event: new DeleteFileEvent(storage, consumer), storage, consumer,
    deliver: (payload: { fileName: string; userId: string }) => deliver(payload),
  };
}

describe('DeleteFileEvent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('deletes the requested storage key and returns it', async () => {
    const { event, storage } = setup();
    const fileName = 'avatars/user-1/old.png';

    await expect(event.handle({ userId: 'user-1', fileName })).resolves.toBe(fileName);
    expect(storage.delete).toHaveBeenCalledExactlyOnceWith(fileName);
  });

  it('propagates a storage failure instead of reporting successful deletion', async () => {
    const { event, storage } = setup();
    const failure = new Error('Storage unavailable');
    storage.delete.mockRejectedValue(failure);

    await expect(event.handle({ userId: 'user-1', fileName: 'avatar.png' })).rejects.toBe(failure);
  });

  it('subscribes to file removal messages and deletes the delivered file', async () => {
    const { event, storage, consumer, deliver } = setup();
    await event.execute();
    expect(consumer.sub).toHaveBeenCalledExactlyOnceWith(
      'exchange.file', 'file-remove-queue', ['file.remove'], 'direct', expect.any(Function),
    );

    await deliver({ userId: 'user-1', fileName: 'avatars/user-1/old.png' });

    expect(storage.delete).toHaveBeenCalledExactlyOnceWith('avatars/user-1/old.png');
  });

  it('rejects a failed message so the consumer does not acknowledge success', async () => {
    const { event, storage, deliver } = setup();
    storage.delete.mockRejectedValue(new Error('Storage unavailable'));
    await event.execute();

    await expect(deliver({ userId: 'user-1', fileName: 'avatar.png' }))
      .rejects.toBeInstanceOf(AppError);
  });
});
