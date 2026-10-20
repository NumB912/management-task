# Environment configuration

All services use APP_ENV to select local, development or production. Backend and
workers also accept NODE_ENV when APP_ENV is unset; default is local. Set the
selector in the terminal or Compose BEFORE starting. NODE_ENV is normalized to
development for local and development, and production for production. Test runners
can use NODE_ENV=test and .env.test. Existing process/Docker variables always win.

| APP_ENV | File in each service directory | NODE_ENV |
| --- | --- | --- |
| local | .env.local | development |
| development | .env.development | development |
| production | .env.production | production |

Backend, file-services, email-services and notifier-services load only the selected
file. They do not fall back to .env. Missing files are allowed for containers that
inject all configuration. Keep existing secrets in your private env files.
Run commands from the corresponding service directory.

```powershell
# Backend local
$env:APP_ENV='local'
npm run start:dev

# Worker local (file-services / email-services / notifier-services)
$env:APP_ENV='local'
npm run dev

# Development server (backend: start:dev, workers: dev)
$env:APP_ENV='development'
npm run dev

# Production (backend: start:prod, workers: start)
$env:APP_ENV='production'
npm start
```

For backend production, build first with npm run build, then npm run start:prod.
Always use Node.js 24 for the env loader and current dependencies.

## Frontend (Next.js)

npm run dev selects .env.local. npm run dev:development selects .env.development.
npm run build and npm start select .env.production. The wrapper preloads the chosen
file before Next.js, preserving injected variables. Next.js may still fill missing
keys from its standard env hierarchy (.env.development.local/.env.production.local,
.env.local, mode file, .env). Avoid stale env files that supply unintended values.
Never use NODE_ENV=local with Next.js. Public NEXT_PUBLIC_* values are fixed at build
time: set production values before npm run build; runtime env_file cannot replace
values already embedded in browser assets. Never put private keys in NEXT_PUBLIC_*.
The existing frontend Docker build reads .env.production from its build context;
the Docker ignore file excludes local/development env files from production builds.

## Docker

```powershell
# Local dependencies and all three workers
 docker compose -f docker-compose.local.yml up -d
# Development frontend/backend/file worker
 docker compose -f docker-compose.developer.yml up -d
# Production
 docker compose -f docker-compose.production.yml up -d --build
```

Each Compose file selects its matching env files. After editing env files, recreate
containers with up -d --force-recreate. Do not run duplicate file consumers across
the local and development stacks. The legacy docker-compose.yml still uses its
original .env configuration; use the explicit files above for environment selection.

## Local connections

| Dependency | Host application | Worker in local Compose |
| --- | --- | --- |
| MongoDB | mongodb://127.0.0.1:27017/task_dev?replicaSet=rs0&directConnection=true | mongodb://mongodb:27017/task_dev?replicaSet=rs0&directConnection=true |
| Redis | redis://127.0.0.1:6379 | redis://redis:6379 |
| RabbitMQ | amqp://taskdev:taskdev@127.0.0.1:5672/%2F?heartbeat=30 | amqp://taskdev:taskdev@rabbitmq:5672/%2F?heartbeat=30 |

Use MONGODB_URI, REDIS_URI and RABBITMQ_URI for backend. Local Compose explicitly
overrides worker RABBITMQ_URI with the Docker hostname; host workers should have
127.0.0.1 in their .env.local. For applications in another Compose network, use
host.docker.internal instead of 127.0.0.1 to reach published dependencies.
MongoDB is a single-node replica set supporting transactions. Data persists in
named volumes. RabbitMQ management is http://localhost:15672 (taskdev/taskdev).
Notifier is published on port 3005 in the current local Compose configuration;
set NEXT_PUBLIC_NOTIFICATION_URL=http://localhost:3005 in frontend .env.local.
Ensure its SECRET_KEY matches backend. File/email are RabbitMQ workers, without
HTTP listeners. File operations require R2 credentials; email requires EMAIL_FROM
and RESEND_API_KEY. Local infrastructure does not replace R2 or Resend.
