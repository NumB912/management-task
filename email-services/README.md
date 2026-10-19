# Email service

Receives OTP, password reset and member invitation events from RabbitMQ.
All three emails share a responsive white card, purple accents and inline styles.

## Resend

1. Create a Resend API key and verify your sending domain in Resend.
2. Configure the server environment (never put the key in frontend variables):

```dotenv
RESEND_API_KEY=re_your_secret_key
EMAIL_FROM=Toboco <noreply@toboco.click>
APP_URL=https://your-app.example.com
RABBITMQ_URI=amqp://user:password@localhost:5672/%2F
```

3. Run `npm ci`, `npm run typecheck`, `npm test`, then `npm start`.
   With the current Docker Compose configuration, set these in `email-services/.env`.
4. Trigger an OTP, reset or invitation from the application using a controlled test recipient.
   API acceptance does not guarantee inbox delivery; inspect delivery status in Resend.

The service uses the Resend HTTPS API exclusively, behind the domain
`IEmailService` interface. Nodemailer and SMTP configuration are no longer used.
Startup fails before connecting to RabbitMQ if `EMAIL_FROM` or `RESEND_API_KEY`
is missing. `EMAIL_FROM` must use a domain verified in your Resend account;
the Toboco address above is an example, not an already verified sender.
`APP_URL` controls the password-reset link (legacy `FRONT_END_URL` remains a fallback).
Use the `.env.*.example` files as templates and keep actual credentials in `.env`
or your deployment secret store.

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
