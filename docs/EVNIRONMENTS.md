# Safar.pk Environments

## Development

Used for local development.

Frontend:
http://localhost:3000

Backend:
http://localhost:4000

API:
http://localhost:4000/api/v1

## Staging

Used to test the integrated application before production.

Branch:
develop

Staging must have its own environment variables and database.

## Production

Used by the final public application.

Branch:
main

Production must have separate credentials and a separate database.

## Environment Variable Rules

- Never commit .env files.
- Commit only .env.example files.
- Development, staging, and production use different credentials.
- Secrets are configured through deployment platforms.
- Frontend variables must not contain backend secrets.