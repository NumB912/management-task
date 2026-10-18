import { Resend } from 'resend';
import { MailConfig } from 'src/config.js';
import NodeMailerService from './nodeMailer.service.js';
import ResendEmailService from './resend.service.js';

export function createEmailService() {
  if (!MailConfig.AUTH.includes('@')) throw new Error('EMAIL_FROM is required');
  if (MailConfig.PROVIDER === 'resend') {
    if (!MailConfig.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required');
    return new ResendEmailService(new Resend(MailConfig.RESEND_API_KEY));
  }
  if (MailConfig.PROVIDER !== 'smtp') throw new Error('EMAIL_PROVIDER must be resend or smtp');
  if (!MailConfig.HOST || !Number(MailConfig.PORT)) throw new Error('HOST_SMTP and PORT_SMTP are required');
  return new NodeMailerService();
}
