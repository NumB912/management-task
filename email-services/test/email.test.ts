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

const email = new Email({ from: 'sender@example.com', to: 'user@example.com', title: 'Test', html: '<p>Hello</p>' });
const client = (result: unknown) => ({ emails: { send: async (payload: unknown) => {
  assert.deepEqual(payload, email.info); return result;
} } }) as unknown as Pick<Resend, 'emails'>;

test('Resend sends existing email payload', async () => {
  await new ResendEmailService(client({ data: { id: 'email-1' }, error: null })).sendEmail(email);
});
for (const [status, retryable] of [[422, false], [429, true], [503, true]] as const) {
  test(`Resend classifies HTTP ${status}`, async () => {
    await assert.rejects(new ResendEmailService(client({ error: { statusCode: status, name: 'test_error' } })).sendEmail(email),
      (err: unknown) => err instanceof EmailDeliveryError && err.retryable === retryable);
  });
}
test('all templates use shared purple layout and escape user content', () => {
  process.env.FRONT_END_URL = 'https://example.com';
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
