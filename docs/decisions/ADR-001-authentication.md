# ADR 001 Authentication Strategy

## Status

Accepted

## Decision

Safar.pk will use email and password authentication.

Passwords will be hashed using Argon2. NestJS will issue short-lived access tokens and longer-lived refresh tokens through HTTP-only cookies.

The backend will enforce CUSTOMER and ADMIN permissions using authentication and role guards.

Password recovery will use a six-digit, hashed, expiring email OTP.

## Consequences

The frontend must send requests with credentials enabled.

CORS and cookie configuration must support the frontend and backend domains.

Refresh tokens must be invalidated during logout and relevant security events.

Admin accounts cannot be created through public signup.