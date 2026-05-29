# Spring Boot Backend

`backend-spring/` la backend chinh hien tai cua repo.

Runtime mac dinh:
- Spring Boot `3.5.3`
- Java `21`
- MySQL
- Flyway
- WebSocket notification gateway
- notification inbox persistence

## Run locally

```bash
cd backend-spring
mvn spring-boot:run
```

Common commands:

```bash
mvn spring-boot:run
mvn clean package
```

## Run with Docker from repo root

```bash
npm run dev
npm run dev:clean
npm run logs
npm run seed
npm run cleanup:regression
npm run regression:spring-stack
npm run smoke:student
npm run smoke:teacher
npm run smoke:admin
```

`npm run dev` la luong chay chinh hien tai, boot `frontend + backend-dev + mysql + nginx`.
`npm run dev:clean` reset volume MySQL va boot lai toan bo stack sach.
`npm run seed` seed theo dung luong chinh (`mysql + backend-dev + frontend + nginx`).

## Production-shaped flow

Luong duoc khuyen nghi de test gan production:

1. `npm run seed`
2. `npm run dev`
3. `npm run regression:spring-stack`

Stack nay su dung:
- `frontend`
- `backend-dev`
- `mysql`
- `nginx`

Health checks da duoc them cho:
- `mysql`
- `backend`
- `frontend`
- `nginx`

## Key environment values

Mac dinh xem tai `src/main/resources/application.yml`:

- `server.port`
- `spring.datasource.*`
- `spring.flyway.*`
- `app.security.jwt-access-secret`
- `app.security.jwt-refresh-secret`
- `app.cors.allowed-origins`
