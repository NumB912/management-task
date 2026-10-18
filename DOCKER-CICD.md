# Docker CI/CD to a VPS

The `docker-vps-cd.yml` workflow validates Docker builds on pull requests to `main`. When code is pushed to `main`, it builds and pushes versioned images to GHCR, copies the production Compose file to the VPS, then pulls the new images and restarts the services. The Next.js frontend is kept separate for Vercel.

## Configure GitHub

Under repository **Settings → Secrets and variables → Actions → Secrets**, add:

- `VPS_HOST`: public hostname or IP of the VPS.
- `VPS_USER`: SSH deployment user; it must be allowed to run Docker Compose.
- `VPS_SSH_PRIVATE_KEY`: private SSH key for that user.
- `VPS_KNOWN_HOSTS`: verified SSH host-key line for the VPS (obtain and verify it out of band; do not disable host-key checking).

The workflow uses the automatically provided `GITHUB_TOKEN` to push images. Grant Actions permission to write packages if repository policy requires it. The GHCR packages must be readable by the VPS. For private packages, log in to GHCR on the VPS once using an account/token with `read:packages`; alternatively make the packages public if that is appropriate for the project.

## Prepare the VPS once

Install Docker Engine and the Compose plugin. Create `/opt/task-management/compose.env` with the lower-case image prefix for this repository:

```dotenv
IMAGE_PREFIX=ghcr.io/owner/repository
ENV_DIR=/opt/task-management/env
```

Create these service-specific files with production values, outside the repository:

```text
/opt/task-management/env/backend.env
/opt/task-management/env/notifier-services.env
/opt/task-management/env/email-services.env
/opt/task-management/env/file-services.env
```

Use the variables from each service's `.env.production.example`. The backend and notifier need the same `SECRET_KEY`; the backend also needs `FRONTEND_URL` for CORS. Keep database, RabbitMQ, SMTP, and R2 credentials on the VPS in the service env files, not in GitHub or in the image. Set restrictive permissions, for example `chmod 600 /opt/task-management/env/*.env`.

Production Compose binds backend and notifier ports to `127.0.0.1`; expose them through a TLS reverse proxy such as Nginx or Caddy. Email and file services are workers and do not publish host ports. Cloud database and RabbitMQ endpoints are supplied through the service env files; this Compose file intentionally does not start local MongoDB, Redis, RabbitMQ, or MailHog.

After the secrets and VPS are configured, pushing to `main` triggers deployment. Pull requests only build the images and do not publish or deploy them. The workflow uses the commit SHA as an immutable image tag so the VPS runs exactly the build created for that commit.
