# backend-spring

`backend-spring/` is the active backend for this repo.

Primary runtime:

- Spring Boot `3.5.3`
- Java `21`
- MySQL
- Flyway
- JWT auth
- WebSocket notifications
- Google ID-token verification for student/teacher sign-in

## How it runs in the app

Recommended stack from the repo root:

```bash
make up
```

That brings up:

- `frontend`
- `backend`
- `mysql`
- `nginx`

Direct backend URL:

- `http://localhost:5000`

Public API via nginx:

- `http://localhost/api`

## Local commands

From the repo root:

```bash
npm run dev
npm run dev:clean
npm run seed
npm run smoke:guest
npm run smoke:student
npm run smoke:teacher
npm run smoke:teacher:exercise
npm run smoke:admin
npm run smoke:google
npm run regression:spring-stack
```

From `backend-spring/` directly:

```bash
mvn spring-boot:run
mvn clean package
```

## Configuration

Main runtime config:

- `src/main/resources/application.yml`

Environment example:

- `.env.example`

Key values:

- `PORT`
- `MYSQL_URL`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `CLIENT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`

## Auth model

Supported sign-in modes:

- email/password for all existing local accounts
- Google popup sign-in for `student` and `teacher`

Current rules:

- `admin` cannot use Google sign-in
- existing local accounts are not auto-linked
- matching email without existing Google link returns `GOOGLE_LINK_REQUIRED`
- Google-created users may have `password_hash = null`

Current automated verification:

- `GOOGLE_ROLE_NOT_ALLOWED`
- `GOOGLE_TOKEN_INVALID`
- `GOOGLE_ROLE_INVALID`

The successful Google popup sign-in path still needs one real browser verification with a Google account allowed by the configured OAuth client.

## Data ownership

This service is responsible for:

- users and auth
- courses and lessons
- enrollments and learning progress
- exercises and mock-tests
- results/submissions
- messages
- posts
- notifications
- admin stats/charts/users

## Flyway

Migrations are stored in:

- `src/main/resources/db/migration/mysql`

Rules for future development:

1. Add new migrations instead of editing old ones.
2. Keep auth schema changes aligned with DTO/service/store/entity updates.
3. Prefer additive migrations.
4. Keep durable seed data separate in intent from transient smoke data.
