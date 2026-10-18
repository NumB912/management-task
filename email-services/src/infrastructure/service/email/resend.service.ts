import { Resend } from 'resend';
import type Email from '@domain/entities/email.entities.js';
import type IEmailService from '@domain/service/email.service.js';

export class EmailDeliveryError extends Error {
  constructor(message: string, public readonly retryable: boolean) {
    super(message);
  }
}

export default class ResendEmailService implements IEmailService {
  constructor(private readonly client: Pick<Resend, 'emails'>) {}

  async sendEmail(email: Email): Promise<void> {
    const { data, error } = await this.client.emails.send(email.info);
    if (error) {
      const status = error.statusCode;
      throw new EmailDeliveryError(
        `Resend: ${error.name}`,
        status === 429 || status === 408 || status == null || status >= 500,
      );
    }
    if (!data?.id) throw new EmailDeliveryError('Resend returned no email ID', true);
  }
}
