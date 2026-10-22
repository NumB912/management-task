import { expect, test, vi } from 'vitest';
import UploadFileEvent from '../src/application/event/uploadFile.event.js';
import type { IStorageService } from '../src/domain/service/IStorageService.js';
import type IConsumer from '../src/domain/message/consumer.message.js';

function setup() {
  const storage = {
    upload: vi.fn<IStorageService['upload']>().mockResolvedValue(undefined),
    listKeys: vi.fn<IStorageService['listKeys']>().mockResolvedValue([]),
    deleteMany: vi.fn<IStorageService['deleteMany']>().mockResolvedValue(undefined),
    delete: vi.fn<IStorageService['delete']>(),
    getDownloadUrl: vi.fn<IStorageService['getDownloadUrl']>(),
    getPublicUrl: vi.fn<IStorageService['getPublicUrl']>(),
  } satisfies IStorageService;
  const consumer = {
    sub: vi.fn<IConsumer['sub']>(),
    subBuffer: vi.fn<IConsumer['subBuffer']>(),
    close: vi.fn<IConsumer['close']>(),
  } satisfies IConsumer;
  const event = new UploadFileEvent(storage, consumer);
  const payload = {
    userId: 'user-1',
    file: {
      buffer: Buffer.from('avatar').toString('base64'),
      mimeType: 'image/png', originalName: 'avatar.png', size: 6, fileName: 'avatar.png',
    },
  };
  return { event, storage, payload };
}

test('uploads the avatar under its user and removes only previous avatars', async () => {
  const { event, storage, payload } = setup();
  storage.listKeys.mockResolvedValue(['avatars/user-1/old.png', 'avatars/user-1/avatar.png']);
  await expect(event.handle(payload)).resolves.toBe('avatar.png');
  expect(storage.upload).toHaveBeenCalledWith({
    key: 'avatars/user-1/avatar.png', body: Buffer.from('avatar'), contentType: 'image/png',
  });
  expect(storage.listKeys).toHaveBeenCalledWith('avatars/user-1/');
  expect(storage.deleteMany).toHaveBeenCalledWith(['avatars/user-1/old.png']);
});

test.each([
  ['invalid user ID', { userId: '../other' }, 'Invalid userId'],
  ['unsupported file type', { file: { mimeType: 'text/html' } }, 'Unsupported file type'],
  ['invalid filename', { file: { fileName: 'bad name.png' } }, 'Invalid fileName'],
  ['oversized decoded content', { file: { buffer: Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64'), size: 1 } }, 'File too large'],
])('rejects %s before writing to storage', async (_name, override, error) => {
  const { event, storage, payload } = setup();
  const input = { ...payload, ...override, file: { ...payload.file, ...('file' in override ? override.file : {}) } };
  await expect(event.handle(input)).rejects.toThrow(error);
  expect(storage.upload).not.toHaveBeenCalled();
  expect(storage.deleteMany).not.toHaveBeenCalled();
});

test('does not remove existing avatars when the upload fails', async () => {
  const { event, storage, payload } = setup();
  storage.upload.mockRejectedValue(new Error('storage unavailable'));
  await expect(event.handle(payload)).rejects.toThrow('storage unavailable');
  expect(storage.listKeys).not.toHaveBeenCalled();
  expect(storage.deleteMany).not.toHaveBeenCalled();
});
