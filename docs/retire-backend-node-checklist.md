# Retire `backend/` Node Checklist

Muc tieu cua checklist nay la retire dan `backend/` mot cach an toan sau khi luong
`frontend + backend-spring + MySQL + Flyway` da on dinh.

## Phase 1. Runtime freeze

- Xac nhan production va local docs deu tro den `backend-spring`.
- Xac nhan root scripts khong con goi `backend/`.
- Giu `archive/backend-node/` o che do read-only doi chieu, khong merge them feature moi.

## Phase 2. Data and seed parity

- Seed native cua `backend-spring` la seed chinh.
- Regression chay tren DB sach va co cleanup sau moi vong.
- Dashboard `admin` khong con bi phong to so lieu do regression cu.

## Phase 3. API parity sign-off

- Auth:
  - login
  - me
  - refresh-token
  - logout
- Courses / lessons:
  - create
  - review
  - publish
  - lesson CRUD
- Enrollment / learning:
  - enroll
  - progress
  - learning payload
- Mock-tests:
  - CRUD
  - submit
  - grading
- Messages:
  - recipients
  - internal message
  - read / replied
- Posts:
  - public list/detail
  - admin CRUD
- Admin:
  - stats
  - charts
  - users list/detail/update
- Notifications:
  - realtime websocket
  - unread inbox persistence

## Phase 4. Mongo fallback retirement

- Hoan tat: da bo config environment `MONGO_URI` khoi production deployment.
- Hoan tat: da xoa `mongo` va `mongo-express` khoi stack production docs.
- Hoan tat: da xoa `application-mongo.yml`, `MongoConfig`, `MongoAuditConfig`.
- Hoan tat: da bo `spring-boot-starter-data-mongodb` khoi `backend-spring/pom.xml`.

## Phase 5. Repository cleanup

- Hoan tat: da dua `backend/` sang `archive/backend-node/`.
- Giu `archive/backend-node/` de doi chieu ngan han trong giai doan cutover.
- Tiep theo can xoa:
  - docs cu huong dan `npm run dev:backend`
  - CI/CD jobs tro den `backend/` neu con sot
  - cac tham chieu legacy khong con gia tri trong tai lieu noi bo

## Current blockers before full removal

- Can them 1-2 vong regression nua tren DB sach sau moi phase hardening.
