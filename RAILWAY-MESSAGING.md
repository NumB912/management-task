# Railway messaging configuration

All four server services (backend, notifier-services, email-services, file-services)
require RABBITMQ_URI. Separate user/password/host/port variables and RABBITMQ_URL
are no longer used by application connections.

```dotenv
# Server services only. URL-encode credentials; replace placeholders.
RABBITMQ_URI=amqp://USER:PASSWORD@RABBIT_HOST:RABBIT_PORT/%2F?heartbeat=30
```

Use RabbitMQ's private domain and port 5672 within the same Railway environment.
For local server processes, expose RabbitMQ port 5672 through a Railway TCP Proxy
and use its public domain and assigned public port. Do not expose broker
credentials through NEXT_PUBLIC variables.

Notifier service variables:

```dotenv
FRONTEND_URL=https://app.example.com
SECRET_KEY=<same signing key as backend>
# Railway supplies PORT; defaults to 3005 locally.
```

Expose notifier-services using Railway HTTP public networking, targeting its
listening PORT. FRONTEND_URL also accepts comma-separated exact frontend origins.

Frontend build variable (rebuild after changing):

```dotenv
NEXT_PUBLIC_NOTIFICATION_URL=https://notify.example.com
```

The frontend already appends /notifications/stream and opens an authenticated SSE
connection with credentials. Users receive notifications through notifier, not
through a direct AMQP connection. RabbitMQ is shared by the server services.

Authentication requires the token cookie to reach notifier. Current backend
cookies are host-only and SameSite=Lax. Separate Railway hostnames will not share
that cookie. Before public end-to-end use, configure a shared custom-domain cookie
scope with HTTPS or route backend and notifier through the same public origin.
Setting CORS alone does not share cookies.
