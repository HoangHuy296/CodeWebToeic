# Backend Route Parity Audit

Muc tieu cua tai lieu nay la kiem tra surface API cua `backend/` cu va doi chieu voi `backend-spring` de retire dan mot cach an toan.

## Route groups tu `backend/`

- `system`
- `auth`
- `courses / lessons`
- `enrollments`
- `learning`
- `mock-tests`
- `messages`
- `posts`
- `admin`

## Da co parity va da duoc smoke test

### System

- `GET /`
- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh-token`
- `PATCH /api/auth/me/profile`
- `POST /api/auth/me/password`
- `POST /api/auth/me/email-change/request`
- `POST /api/auth/me/email-change/confirm`
- `POST /api/auth/me/phone-change/request`
- `POST /api/auth/me/phone-change/confirm`

### Courses / lessons

- `GET /api/courses`
- `GET /api/courses/manage/mine`
- `GET /api/courses/:slug`
- `POST /api/courses`
- `PATCH /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/courses/:courseId/lessons`
- `PATCH /api/lessons/:id`
- `DELETE /api/lessons/:id`

### Enrollments / learning

- `POST /api/enrollments`
- `GET /api/enrollments/me`
- `GET /api/enrollments/course/:courseId`
- `PATCH /api/enrollments/:courseId/progress`
- `GET /api/learning/:courseId`

### Mock-tests

- `GET /api/mock-tests`
- `GET /api/mock-tests/manage/mine`
- `GET /api/mock-tests/:id`
- `POST /api/mock-tests`
- `PATCH /api/mock-tests/:id`
- `DELETE /api/mock-tests/:id`
- `POST /api/mock-tests/:id/submit`

### Messages

- `GET /api/messages`
- `GET /api/messages/recipients`
- `POST /api/messages`
- `POST /api/messages/internal`
- `PATCH /api/messages/:id/read`

### Posts

- `GET /api/posts`
- `GET /api/posts/:slug`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/charts/revenue`
- `GET /api/admin/charts/enrollments`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

## Script coverage hien co

- `npm run regression:spring-stack`
- `npm run smoke:student`
- `npm run smoke:teacher`
- `npm run smoke:admin`

## Luu y van hanh

- Truoc khi chay smoke/regression, stack `frontend + backend-spring + mysql + nginx` phai healthy.
- Cac script hien tai se check `GET /api/health` truoc khi chay de bao loi ha tang som.
- Cleanup script van can Docker CLI truy cap duoc den `codewebtoeic-mysql-1`.

## Dieu kien de retire tiep `backend/`

1. Ca 3 smoke tests theo role deu pass on dinh.
2. Regression tong hop pass tren DB sach.
3. Khong con route nao chi ton tai o `backend/` ma `backend-spring` chua co.
4. Team chot khong can fallback Mongo de doi chieu migration nua.
