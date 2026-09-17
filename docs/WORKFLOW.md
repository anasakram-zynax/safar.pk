# Development Workflow

## Branches

- main contains production-ready code.
- develop contains the latest integrated development work.
- Feature branches start from develop.
- Feature branches return to develop through pull requests.
- Production releases merge develop into main.

## Branch Naming

- feature/feature-name
- fix/bug-name
- hotfix/urgent-fix
- docs/document-name
- test/test-name

## Commit Convention

- feat: add customer signup
- fix: correct price filter
- docs: update API documentation
- test: add authentication tests
- refactor: simplify cart service
- chore: update dependencies

## Pull Request Requirements

Every pull request must:

- Have a clear title and description
- Reference its requirement or phase
- Pass linting
- Pass type checking
- Pass relevant tests
- Contain no secrets
- Be tested locally