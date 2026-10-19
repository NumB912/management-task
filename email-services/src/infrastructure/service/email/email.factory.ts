import { Resend } from 'resend';
import { MailConfig } from 'src/config.js';
import ResendEmailService from './resend.service.js';

export function createEmailService(config = MailConfig) {
  if (!config.AUTH.includes('@')) throw new Error('EMAIL_FROM is required');
  if (!config.RESEND_API_KEY?.trim()) throw new Error('RESEND_API_KEY is required');
  return new ResendEmailService(new Resend(config.RESEND_API_KEY.trim()));
}
