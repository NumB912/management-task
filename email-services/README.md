# Email service

Receives OTP, password reset and member invitation events from RabbitMQ.
All three emails share a responsive white card, purple accents and inline styles.

## Resend

1. Create a Resend API key and verify your sending domain in Resend.
2. Configure the server environment (never put the key in frontend variables):

```dotenv
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_secret_key
EMAIL_FROM=Task Management <no-reply@your-verified-domain.com>
APP_URL=https://your-app.example.com
RABBITMQ_URI=amqp://user:password@localhost:5672/%2F
```

3. Run `npm ci`, `npm run typecheck`, `npm test`, then `npm start`.
   For Docker production, set these in the `email-services.env` deployment file.
4. Trigger an OTP, reset or invitation from the application using a controlled test recipient.
   API acceptance does not guarantee inbox delivery; inspect delivery status in Resend.

## Local SMTP

Use `EMAIL_PROVIDER=smtp`, `EMAIL_FROM=developer@example.com`, `HOST_SMTP`
and `PORT_SMTP` for your local mail catcher. `AUTH_GOOGLE_EMAIL` remains a
legacy fallback for the sender. Existing SMTP transport is intended for local use.

## Failures

Handlers await delivery before acknowledging messages. Temporary failures retry
up to three total attempts with 1s and 2s delays. Resend permanent API failures
skip retries. Failed messages are persisted in `<original-queue>.failed`; the
original is acknowledged only after RabbitMQ confirms the failed message publish.
Inspect and manually replay them after correcting the cause. Protect these queues:
their payloads contain recipient addresses and OTP/reset/invitation secrets.
Delivery remains at least once; ambiguous network failures can produce duplicates.

Tests mock Resend and do not send real email. Real delivery needs valid credentials,
a verified sender, RabbitMQ and an explicitly selected test recipient.
