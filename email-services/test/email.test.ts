import test from 'node:test';
import assert from 'node:assert/strict';
import type { Resend } from 'resend';
import ResendEmailService, { EmailDeliveryError } from '../src/infrastructure/service/email/resend.service.js';
import Email from '../src/domain/entities/email.entities.js';
import { otpTemplate } from '../src/application/template/sendOpt.template.js';
import { resetPasswordTemplate } from '../src/application/template/sendChangePass.template.js';
import { inviteTemplate } from '../src/application/template/sendInvite.template.js';
import SendEmail from '../src/application/usecase/email.usecase.js';
import SendOtp from '../src/application/event/sendOtp.event.js';
import SendChange from '../src/application/event/sendChangePass.event.js';
import SendInvite from '../src/application/event/sendInviteMember.event.js';
import type IConsumer from '../src/domain/message/consumer.message.js';
import { createEmailService } from '../src/infrastructure/service/email/email.factory.js';

test('factory creates Resend directly and requires a configured sender and API key', () => {
  assert.ok(createEmailService({ AUTH: 'Toboco <noreply@toboco.click>', RESEND_API_KEY: 're_test_placeholder' }) instanceof ResendEmailService);
  assert.throws(() => createEmailService({ AUTH: '', RESEND_API_KEY: 're_test_placeholder' }), /EMAIL_FROM/);
  assert.throws(() => createEmailService({ AUTH: 'sender@example.com', RESEND_API_KEY: undefined }), /RESEND_API_KEY/);
  assert.throws(() => createEmailService({ AUTH: 'sender@example.com', RESEND_API_KEY: '  ' }), /RESEND_API_KEY/);
});

const email = new Email({ from: 'sender@example.com', to: 'user@example.com', title: 'Test', html: '<p>Hello</p>' });
const client = (result: unknown) => ({ emails: { send: async (payload: unknown) => {
  assert.deepEqual(payload, email.info); return result;
} } }) as unknown as Pick<Resend, 'emails'>;

test('Resend sends existing email payload', async () => {
  await new ResendEmailService(client({ data: { id: 'email-1' }, error: null })).sendEmail(email);
});
test('Resend rejects a response without a delivery ID', async () => {
  await assert.rejects(new ResendEmailService(client({ data: null, error: null })).sendEmail(email),
    (error: unknown) => error instanceof EmailDeliveryError && error.retryable);
});
for (const [status, retryable] of [[422, false], [429, true], [503, true]] as const) {
  test(`Resend classifies HTTP ${status}`, async () => {
    await assert.rejects(new ResendEmailService(client({ error: { statusCode: status, name: 'test_error' } })).sendEmail(email),
      (err: unknown) => err instanceof EmailDeliveryError && err.retryable === retryable);
  });
}
test('all templates use shared purple layout and escape user content', () => {
  process.env.APP_URL = 'https://example.com';
  for (const html of [otpTemplate({ userName: '<script>', otp: '123456' }),
    resetPasswordTemplate({ userName: '<script>', resetLink: 'a/b' }),
    inviteTemplate({ name: '<script>', ownerName: 'Owner', listName: '<script>', inviteLink: 'https://example.com/invite?a=1&b=2' })]) {
    assert.ok(html.includes('#7c3aed'));
    assert.ok(html.includes('TASK MANAGEMENT'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
  }
  assert.throws(() => inviteTemplate({ name: 'A', ownerName: 'B', listName: 'C', inviteLink: 'javascript:alert(1)' }));
});
test('all three event handlers propagate delivery failures before acknowledgement', async () => {
  process.env.EMAIL_FROM = 'sender@example.com';
  const { MailConfig } = await import('../src/config.js');
  MailConfig.AUTH = 'sender@example.com';
  const uc = new SendEmail({ sendEmail: async () => { throw new Error('delivery failed'); } });
  const consumer = {} as IConsumer;
  await assert.rejects(new SendOtp(uc, consumer).handle({ email: 'user@example.com', otp: '123456' }), /delivery failed/);
  await assert.rejects(new SendChange(uc, consumer).handle({ email: 'user@example.com', token: 'token' }), /delivery failed/);
  await assert.rejects(new SendInvite(uc, consumer).handle({ email: 'user@example.com', name: 'A', ownerName: 'B', listName: 'C', inviteLink: 'https://example.com/invite' }), /delivery failed/);
});

test('OTP, reset and invitation events all send through the email use case', async () => {
  const { MailConfig } = await import('../src/config.js');
  const previous = MailConfig.AUTH;
  const previousAppUrl = process.env.APP_URL;
  process.env.APP_URL = 'https://example.com';
  MailConfig.AUTH = 'Toboco <noreply@toboco.click>';
  const sent: Email[] = [];
  const usecase = new SendEmail({ sendEmail: async email => { sent.push(email); } });
  const consumer = {} as IConsumer;
  try {
    await new SendOtp(usecase, consumer).handle({ email: 'user@example.com', otp: '123456' });
    await new SendChange(usecase, consumer).handle({ email: 'user@example.com', token: 'reset-token' });
    await new SendInvite(usecase, consumer).handle({ email: 'user@example.com', name: 'Alice', ownerName: 'Bob', listName: 'Team', inviteLink: 'https://example.com/invite' });
    assert.equal(sent.length, 3);
    for (const message of sent) {
      assert.equal(message.info.from, 'Toboco <noreply@toboco.click>');
      assert.equal(message.info.to, 'user@example.com');
    }
    assert.ok(sent[1]!.info.html.includes('https://example.com/auth/reset-password/reset-token'));
  } finally {
    MailConfig.AUTH = previous;
    if (previousAppUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = previousAppUrl;
  }
});
