# IVYTS 1997 E-Learning CRM

Luong chay production hien tai cua repo la:

- `frontend/`: Vite + React + TypeScript
- `backend-spring/`: Spring Boot backend chinh
- `MySQL + Flyway`: schema, seed va runtime data mac dinh
- `nginx`: public entrypoint qua Docker

## Repo structure

```text
.
|-- frontend/
|-- archive/
|-- backend-spring/
|-- docs/
|-- nginx/
|-- scripts/
`-- docker-compose.yml
```

## Roles

- `student`
- `teacher`
- `admin`

## Main product areas

- public marketing pages
- admin login rieng
- courses / lessons / review workflow
- learning progress
- exercises
- mock-tests + grading
- internal messages
- notification bell realtime + unread persistence

## Production path

Neu muon chay dung luong moi, dung:

- `frontend + backend-spring + MySQL + Flyway`

## Main commands

Run the main app stack:

```bash
npm run dev
```

Lenh nay la luong chay chinh hien tai. No boot dung 4 container:

- `frontend-1`
- `backend-dev-1`
- `mysql-1`
- `nginx-1`

URLs:

- web app: `http://localhost`
- backend direct: `http://localhost:5000`
- MySQL host: `3307`

Neu can reset sach DB va boot lai toan bo stack:

```bash
npm run dev:clean
```

Xem log cac container trong luong chinh:

```bash
npm run logs
```

Neu can chay rieng Vite local khong qua Docker:

```bash
npm run dev:frontend
```

Build frontend:

```bash
npm run build:frontend
```

Build backend image:

```bash
npm run build:backend-spring
```

## Seed, cleanup, smoke tests

Seed native qua Flyway + startup:

```bash
npm run seed
```

Lenh nay reset va seed theo dung luong chinh:

- `mysql`
- `backend-dev`
- `frontend`
- `nginx`

Cleanup regression data chu dong trong MySQL:

```bash
npm run cleanup:regression
```

Regression tong hop theo role:

```bash
npm run regression:spring-stack
```

Smoke test rieng cho `student`:

```bash
npm run smoke:student
```

Smoke test rieng cho `teacher`:

```bash
npm run smoke:teacher
```

Smoke test rieng cho `admin`:

```bash
npm run smoke:admin
```

## Docker runtime

Stack mac dinh:

- `frontend`
- `backend`
- `mysql`
- `nginx`

Fallback/tooling:

- `frontend-dev`
- `backend-dev`

## Environment

### Frontend

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Khi chay qua Docker/Nginx, frontend co the dung `/api`.

### Spring backend

`backend-spring/.env.example`

```env
PORT=5000
MYSQL_URL=jdbc:mysql://127.0.0.1:3307/ivyts_1997?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost
JWT_ACCESS_SECRET=replace-me1
JWT_REFRESH_SECRET=replace-me
```

Luu y:

- `application.yml` hien tai la MySQL runtime mac dinh

## Notification bell

Notification bell hien tai hoat dong theo 2 lop:

- realtime qua WebSocket
- unread persistence trong MySQL

Nghia la:

- neu user online, bell nhan event realtime ngay
- neu user offline, unread van duoc luu vao MySQL
- khi user mo lai tab, focus lai tab, hoac reconnect websocket, frontend se sync lai inbox tu server

## Role smoke coverage

Hien repo da co smoke scripts rieng theo role:

- `npm run smoke:student`
- `npm run smoke:teacher`
- `npm run smoke:admin`

Va mot regression tong hop:

- `npm run regression:spring-stack`

Tat ca smoke/regression scripts gio deu check `http://localhost/api/health` truoc. Neu stack chua len, script se dung som voi huong dan ro rang thay vi fail mo ho.

## Flyway

Migrations nam tai:

- [backend-spring/src/main/resources/db/migration/mysql](D:/CodeWebToeic/backend-spring/src/main/resources/db/migration/mysql)

Hien dang cover:

- `users`
- `courses`
- `lessons`
- `enrollments`
- `enrollment_lesson_progress`
- `mock_tests`
- `mock_test_questions`
- `mock_test_question_options`
- `test_submissions`
- `test_submission_answers`
- `blog_posts`
- `messages`
- `orders`
- `notifications`

## Sample accounts

- Admin: `admin@ivyts.dev / Password@123`
- Teacher 1: `teacher@ivyts.dev / Password@123`
- Teacher 2: `teacher2@ivyts.dev / Password@123`
- Student 1: `student1@ivyts.dev / Password@123`
- Student 2: `student2@ivyts.dev / Password@123`
- Student 3: `student3@ivyts.dev / Password@123`

## Route groups

### Public

- `/`
- `/courses`
- `/courses/:slug`
- `/mock-test`
- `/exercises`
- `/exercises/:topicSlug`
- `/blog`
- `/portfolio`
- `/login`
- `/register`
- `/admin/login`

### Student

- `/student/dashboard`
- `/student/profile`
- `/student/messages`
- `/student/my-courses`
- `/student/learn/:courseId`
- `/student/mock-tests`
- `/student/mock-tests/:id`

### Teacher

- `/teacher/dashboard`
- `/teacher/courses`
- `/teacher/courses/:slug/lessons`
- `/teacher/mock-tests`
- `/teacher/mock-tests/create`
- `/teacher/mock-tests/:slug`
- `/teacher/results`
- `/teacher/students`
- `/teacher/messages`

### Admin

- `/admin/dashboard`
- `/admin/users`
- `/admin/courses`
- `/admin/courses/create`
- `/admin/courses/:slug/lessons`
- `/admin/mock-tests`
- `/admin/mock-tests/create`
- `/admin/mock-tests/:slug`
- `/admin/posts`
- `/admin/messages`
- `/admin/settings`

## Current backend-spring status

Da qua smoke test tren luong `Spring + MySQL + Flyway`:

- `auth/users`
- `courses/lessons`
- `enrollments/learning`
- `mock-tests`
- `messages`
- `posts`
- `admin stats/users/charts`
- `notification websocket`
- `notification inbox persistence`

## Retire backend/ Node

`backend/` da duoc dua sang `archive/backend-node/` de tham chieu legacy, va khong con nam trong root scripts chinh.

Checklist retire dan:

- [docs/retire-backend-node-checklist.md](D:/CodeWebToeic/docs/retire-backend-node-checklist.md)

## Smoke automation

Repo da co workflow:

- `.github/workflows/spring-stack-smoke.yml`

Workflow nay build `backend-spring`, build `frontend`, boot stack `Spring + MySQL`, sau do chay:

- `smoke:admin`
- `smoke:teacher`
- `smoke:student`
- `regression:spring-stack`
