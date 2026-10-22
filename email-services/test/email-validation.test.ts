import { describe, expect, it, vi } from 'vitest';
import Email from '../src/domain/entities/email.entities.js';
import SendEmail from '../src/application/usecase/email.usecase.js';

const validEmail = {
  to: 'user@example.com',
  from: 'sender@example.com',
  title: 'Your verification code',
  html: '<p>123456</p>',
};

describe('Email validation', () => {
  it.each(['', 'invalid-address'])('rejects invalid recipient %j', (to) => {
    expect(() => new Email({ ...validEmail, to })).toThrow('"to"');
  });

  it.each(['', 'invalid-address'])('rejects invalid sender %j', (from) => {
    expect(() => new Email({ ...validEmail, from })).toThrow('"from"');
  });

  it('rejects an empty subject', () => {
    expect(() => new Email({ ...validEmail, title: '' })).toThrow('Tiêu đề');
  });

  it('allows an email without HTML content', () => {
    const email = new Email({ ...validEmail, html: undefined });
    expect(email.info).toEqual({
      to: validEmail.to, from: validEmail.from,
      subject: validEmail.title, html: '',
    });
  });
});

describe('SendEmail', () => {
  it('sends the provided email exactly once', async () => {
    // Arrange: dùng service giả để không gửi email thật.
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const usecase = new SendEmail({ sendEmail });
    const email = new Email(validEmail);

    // Act: thực hiện chức năng cần kiểm tra.
    await usecase.execute(email);

    // Assert: kiểm tra hành vi quan sát được.
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(email);
  });

  it('propagates delivery errors so the caller can retry', async () => {
    const failure = new Error('Email provider unavailable');
    const sendEmail = vi.fn().mockRejectedValue(failure);
    const usecase = new SendEmail({ sendEmail });

    await expect(usecase.execute(new Email(validEmail))).rejects.toBe(failure);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
