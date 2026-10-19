# Dependency injection modules

`AppModule` composes HTTP feature modules and initializes configuration. Providers
are scoped to their owning module; there is no global application container.

## Shared infrastructure

- `platform/database.module.ts`: MongoDB connection and database models.
- `platform/cache.module.ts`: Redis and the shared `TaskDetailCache` instance.
- `platform/messaging.module.ts`: RabbitMQ publisher.
- `platform/persistence.module.ts`: repositories, internal mappers, and the
  request-scoped unit of work. Mappers are not exported.
- `platform/core-services.module.ts`: ID generation, filter parsing, and deadline
  calculation.

## Application features

Each feature's `*.providers.ts` registers its use case factories, while
`*.module.ts` declares imports, controllers, middleware, and public exports.
Use cases continue to depend on domain interfaces; NestJS wiring stays here.

- `security`: token, credentials, OTP, account access and permission checks.
- `notifications`: notification queries, read actions and realtime notification.
- `rules`: rule creation shared by task use cases.
- `auth`, `user`, `lists`, `members`, `sections`, `tasks`, `tags`, `filters`,
  `pomodoro`, `workspace`, `color`, `admin`, `statistics`: their respective HTTP
  features and dependencies.

Import the owning module when another feature needs a provider. Export only the
providers needed by other modules. For example, auth imports `ListsModule` for
list initialization, and workspace imports it for inbox queries. Members and
tasks import the shared tag use cases from `TagsModule`.

Keep external connections in the platform modules so importing several features
reuses one provider instance. Preserve `Scope.REQUEST` on the unit of work so
transactions cannot share a session across requests.

Protected routes apply `VerifyTokenMiddleware` followed by
`CheckAccountStatusMiddleware`, before resource permission middleware. The status
middleware calls `CheckAccountAccessUsecase` on every request: blocked accounts
receive HTTP 403, and missing accounts or identities receive HTTP 401. Locking or
unlocking an account therefore affects existing sessions immediately.

`module-wiring.spec.ts` compiles the application, initializes its middleware and
checks shared providers and transaction scopes with external connections mocked.
