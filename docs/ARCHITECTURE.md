# Safar.pk Architecture

## Application Flow

Next.js Web Application
    -> NestJS REST API
        -> Prisma ORM
            -> Supabase PostgreSQL

NestJS also communicates with:

- Resend for email delivery
- Cloudinary for image storage

## API Convention

All endpoints use the following prefix:

/api/v1

Examples:

- /api/v1/auth/login
- /api/v1/tours
- /api/v1/cart
- /api/v1/bookings
- /api/v1/admin/tours

## Application Boundaries

Next.js is responsible for presentation, routing, forms, animations, and browser interactions.

NestJS contains authentication, authorization, validation, business rules, and database access.

Prisma is the only application layer that communicates directly with PostgreSQL.

External service credentials remain on the backend.