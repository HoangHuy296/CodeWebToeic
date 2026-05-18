# Spring Boot Backend Migration

This module is the Java 21 + Spring Boot 3.x migration foundation for the existing Node.js backend.

## Why this exists

The current `backend/` service is still the production implementation.  
`backend-spring/` is a safe parallel migration target so we can:

- keep the current API working
- mirror the domain model in Java
- migrate route groups incrementally
- avoid a destructive rewrite-in-place

## Current scope

- Spring Boot `3.5.3`
- JDK `21`
- MongoDB via Spring Data MongoDB
- JWT configuration foundation
- CORS / security configuration
- global API response and exception handling
- mirrored controllers for the main API groups with migration placeholders
- concrete health endpoint: `GET /api/health`

## Run locally

```bash
cd backend-spring
mvn spring-boot:run
```

## Key environment values

See `src/main/resources/application.yml`.

- `server.port`
- `spring.data.mongodb.uri`
- `app.security.jwt-access-secret`
- `app.security.jwt-refresh-secret`
- `app.cors.allowed-origins`

## Migration direction

1. Move domain models and repositories.
2. Move auth and JWT flow.
3. Move course / enrollment / learning logic.
4. Move mock-test / messages / admin flows.
5. Retire the Node.js backend only after route parity is complete.
