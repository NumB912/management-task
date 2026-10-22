import { describe, expect, it } from 'vitest';
import FileUpload from '../src/domain/entities/file.entities.js';
import { ValidationError } from '../src/domain/errors/AppError.js';

const validFile = {
  buffer: Buffer.from('file content'),
  originalName: 'document.txt',
  mimetype: 'text/plain',
};

describe('FileUpload validation', () => {
  it('rejects an empty file', () => {
    expect(() => new FileUpload({ ...validFile, buffer: Buffer.alloc(0) }))
      .toThrow(ValidationError);
  });

  it.each(['', '   '])('rejects a missing original filename %j', (originalName) => {
    expect(() => new FileUpload({ ...validFile, originalName }))
      .toThrow('Thiếu tên file gốc');
  });

  it('accepts a file at the exact size limit', () => {
    const file = new FileUpload({ ...validFile, maxSizeBytes: validFile.buffer.length });
    expect(file.size).toBe(validFile.buffer.length);
  });

  it('rejects a file one byte above the size limit', () => {
    expect(() => new FileUpload({ ...validFile, maxSizeBytes: validFile.buffer.length - 1 }))
      .toThrow('File vượt quá dung lượng');
  });

  it('enforces the default 10 MB limit', () => {
    expect(() => new FileUpload({ ...validFile, buffer: Buffer.alloc(10 * 1024 * 1024 + 1) }))
      .toThrow(ValidationError);
  });

  it('trims the filename and supplies a default MIME type', () => {
    const file = new FileUpload({ ...validFile, originalName: ' document.txt ', mimetype: '' });
    expect(file.originalName).toBe('document.txt');
    expect(file.mimetype).toBe('application/octet-stream');
  });
});
