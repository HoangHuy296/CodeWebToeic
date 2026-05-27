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

If you only run `mvn`, Maven will fail with:

```text
No goals have been specified for this build
```

because Maven always needs an explicit lifecycle phase or plugin goal.

Common commands:

```bash
mvn spring-boot:run
mvn clean package
```

## Run with Docker from repo root

This is the safer path on this repo because the container already uses Java 21 even if your host machine does not.

```bash
npm run dev:backend-spring
npm run logs:backend-spring
npm run build:backend-spring
npm run up:spring-stack
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
