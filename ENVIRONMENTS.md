# Development and production environments

Each service has `.env.development.example` and `.env.production.example` templates. They contain placeholders only and are safe to commit. Copy the relevant template to the filename that the service or Docker Compose loads, then fill in local values or deployment secrets.

## Local development

Start the local dependencies with `docker compose up -d mongodb redis rabbitmq mailhog`. The development templates assume these ports from `docker-compose.yml`: MongoDB `27017` with replica set `rs0`, Redis `6379`, RabbitMQ `5672`, and MailHog SMTP `3050`.

For PowerShell, copy each service template to its `.env` file:

```powershell
Copy-Item backend/.env.development.example backend/.env
Copy-Item file-services/.env.development.example file-services/.env
Copy-Item email-services/.env.development.example email-services/.env
Copy-Item notifier-services/.env.development.example notifier-services/.env
Copy-Item task-management/.env.development.example task-management/.env.local
```

Run each service's development script from its own directory. The frontend uses `.env.local`; the other services and the current Compose file use `.env`.

## Production

Use the production templates as a checklist for the variables each service needs. Add the actual values to the hosting platform's environment/secrets settings rather than committing filled-in files. For a self-hosted deployment using Compose, copy each backend service's production template to that service's `.env`; set the frontend variables in the build environment before building Next.js.

Replace every `<...>` placeholder. Generate distinct, long random signing secrets for production and provide the same `SECRET_KEY` to backend and notifier where token verification requires it. Use TLS endpoints (`mongodb+srv`, `rediss`, `amqps`, and HTTPS) where supported by the production providers.

All `NEXT_PUBLIC_*` values are embedded in the frontend bundle and visible to users. `NEXT_PUBLIC_SECRET_KEY` is therefore public configuration, not a secure server-side signing secret; keep private signing secrets in backend-only variables.

The repository `.gitignore` excludes real `.env*` files while allowing `*.example` templates. Existing environment files that were already tracked by Git remain tracked until they are explicitly removed from the index.
