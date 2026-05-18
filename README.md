# IVYTS 1997 CRM / E-Learning System

Monorepo cho website CRM + LMS tiếng Anh `IVYTS 1997`, tập trung vào:

- bán và quản lý khóa học TOEIC / IELTS
- học online theo lesson + progress
- mock-test có chấm điểm server-side
- inbox nội bộ giữa admin / teacher / student
- dashboard quản trị, teacher workspace và student workspace
- realtime `notification-bell` qua WebSocket

## 1. Repo structure

```text
.
├─ frontend/
├─ backend/
└─ README.md
```

## 2. Tech stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT access token + refresh token
- bcrypt
- Zod
- Helmet
- CORS
- express-rate-limit
- WebSocket gateway nội bộ cho notification

## 3. Current product overview

Hệ thống hiện đã có đủ các lớp chính cho một MVP LMS/CRM:

- public marketing pages
- auth cho `student`, `teacher`, `admin`
- admin login riêng tại `/admin/login`
- course review workflow giữa `teacher` và `admin`
- lesson management workspace riêng theo course
- enrollments + learning progress
- mock-test public / assigned / managed theo role
- blog / post management
- internal messages
- admin analytics

## 4. Roles and main workflows

### Guest

- xem homepage, course listing, course detail, blog, portfolio
- xem mock-test public miễn phí do admin publish
- đăng nhập / đăng ký

### Student

- đăng ký khóa học đã publish
- vào trang học full-screen
- theo dõi progress theo lesson
- làm mock-test:
  - bài free do admin publish
  - bài được assign theo course đã enroll
- nhắn tin cho admin
- nhắn tin cho teacher sở hữu course đã enroll
- cập nhật profile, đổi email / phone / password

### Teacher

- tạo course của riêng mình
- course mới luôn đi theo luồng review
- nhận notification khi admin:
  - yêu cầu chỉnh sửa
  - từ chối
  - publish
- quản lý lesson trong workspace riêng theo course
- tạo mock-test cho student của mình
- xem bài thi free do admin publish như một user
- xem roster học viên và progress
- nhắn tin với admin và student thuộc course của mình

### Admin

- đăng nhập riêng tại `/admin/login`
- quản lý users / courses / mock-tests / posts / messages
- review course của teacher:
  - approve + publish
  - yêu cầu chỉnh sửa
  - từ chối
- tạo mock-test free cho toàn hệ thống
- theo dõi revenue / enrollments / stats

## 5. Local setup

## Install

```bash
npm install
```

## Create env files

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Recommended local env

`backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ivyts-1997
JWT_ACCESS_SECRET=ivyts-access-secret-dev
JWT_REFRESH_SECRET=ivyts-refresh-secret-dev
CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Run backend

```bash
npm run dev:backend
```

Backend mặc định:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Run frontend

```bash
npm run dev:frontend
```

Frontend thường chạy ở:

- `http://localhost:5173`
- hoặc `http://localhost:5174`
- hoặc `http://localhost:5175`

do Vite sẽ tự tăng port nếu port trước đã bị chiếm.

## Build

```bash
npm run build:backend
npm run build:frontend
```

## Seed data

```bash
npm run seed
```

Seed hiện tại tạo:

- `1 admin`
- `2 teachers`
- `3 students`
- `5 courses`
  - published
  - pending review
  - changes requested
- lessons cho TOEIC / IELTS
- enrollments + learning progress
- orders cho revenue chart
- `2 mock-tests` x `10 questions`
- blog posts
- public contact messages

## Sample accounts

- Admin: `admin@ivyts.dev` / `Password@123`
- Teacher 1: `teacher@ivyts.dev` / `Password@123`
- Teacher 2: `teacher2@ivyts.dev` / `Password@123`
- Student 1: `student1@ivyts.dev` / `Password@123`
- Student 2: `student2@ivyts.dev` / `Password@123`
- Student 3: `student3@ivyts.dev` / `Password@123`

## 6. Main routes

### Public

- `/`
- `/courses`
- `/courses/:slug`
- `/mock-test`
- `/blog`
- `/blog/:slug`
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

## 7. Backend architecture review

Phần backend đang đi theo hướng:

- `route` nhận request và gắn middleware
- `controller` nhận input đã validate, gọi service
- `service` chứa business logic
- `model` là schema / persistence layer
- `utils` chứa transform, JWT, response helpers

### `backend/src/constants`

Chứa constants dùng chung cho toàn API.

Hiện tại quan trọng nhất:

- `http-status.ts`
  dùng làm nguồn HTTP code thống nhất để tránh hardcode số trong service/controller.

### `backend/src/middlewares`

Đây là lớp cross-cutting cho toàn API:

- `auth.middleware.ts`
  parse Bearer token và gắn `req.user`
- `role.middleware.ts`
  RBAC theo role
- `validate.middleware.ts`
  validate request bằng Zod
- `security.middleware.ts`
  `helmet`, `cors`, `rate-limit`, `morgan`
- `error-handler.middleware.ts`
  convert mọi lỗi về format API chuẩn
- `not-found.middleware.ts`
  fallback 404 thống nhất

### `backend/src/models`

Đây là lớp domain persistence. Các model chính:

- `user.model.ts`
  auth + profile + pending email/phone verification
- `course.model.ts`
  khóa học, media metadata, pricing, review status, publish status
- `lesson.model.ts`
  lesson thuộc course
- `enrollment.model.ts`
  quan hệ student-course + progress
- `mock-test.model.ts`
  container của đề thi
- `question.model.ts`
  câu hỏi + đáp án đúng + giải thích
- `test-submission.model.ts`
  lần nộp bài đã chấm điểm
- `blog-post.model.ts`
  bài viết
- `message.model.ts`
  public contact + internal inbox
- `order.model.ts`
  order / revenue

### `backend/src/services`

Đây là nơi chứa business logic chính của hệ thống:

- `auth.service.ts`
  register, login, refresh, logout, me, profile self-service
- `course.service.ts`
  course CRUD, lesson CRUD, review workflow teacher/admin
- `enrollment.service.ts`
  enroll + progress update + roster
- `learning.service.ts`
  payload tổng hợp cho learning page
- `mock-test.service.ts`
  visibility, manage permission, grading
- `message.service.ts`
  inbox, recipients, internal messaging permission
- `post.service.ts`
  blog CRUD
- `admin.service.ts`
  stats, charts, user management
- `notification.service.ts`
  WebSocket gateway
- `notification-events.service.ts`
  mapping business event -> bell notification

## 8. Notification system review

Hệ thống notification hiện dùng:

- backend WebSocket gateway `/ws/notifications`
- frontend `notification-bell`
- phân phối theo:
  - `roles`
  - `userIds`
  - `excludeUserIds`

Các event đang có:

- đăng ký user mới
- cập nhật profile thành công / thất bại
- create / update / review / publish course
- enrollment mới
- post mới
- internal message gửi / nhận

## 9. Course review workflow

### Teacher create / update course

- teacher tạo course
- backend ép course về `draft`
- `reviewStatus` đi theo luồng review
- admin nhận notification

### Admin review

Admin có thể:

- approve + publish
- yêu cầu chỉnh sửa
- từ chối

### Teacher resubmit

- teacher vào `/courses/:slug`
- chỉnh sửa course draft của chính mình
- bấm lưu
- backend tự đưa về:
  - `reviewStatus = pending_review`
  - `isPublished = false`
- admin nhận notification để review lại

## 10. Mock-test visibility rules

### Student

Student thấy:

- bài free do admin publish
- bài assign cho course mà student đã enroll

### Teacher

Teacher thấy:

- bài free published của admin
- bài do chính teacher tạo

### Admin

Admin thấy và quản lý toàn bộ mock-tests.

## 11. Messaging rules

### Admin

- nhắn cho teacher
- nhắn cho student

### Teacher

- nhắn cho admin
- nhắn cho student đang enroll course của teacher

### Student

- nhắn cho admin
- nhắn cho teacher sở hữu course mà student đã enroll

## 12. Student profile workflow

`/student/profile` hiện có:

- update `fullName`
- update `avatarUrl`
- upload avatar local -> lưu chuỗi vào `avatarUrl`
- update `bio`
- đổi `password`
- đổi `email` qua verify workflow
- đổi `phone` qua OTP workflow
- hiển thị khóa học đã enroll

Lưu ý:

- hiện tại email/phone verification đang dùng `verificationPreviewCode`
- đây là workflow local/dev
- chưa nối provider email hoặc SMS thật

## 13. Quick smoke checklist

1. Seed data

```bash
npm run seed
```

2. Run backend

```bash
npm run dev:backend
```

3. Run frontend

```bash
npm run dev:frontend
```

4. Test public area

- `/`
- `/courses`
- `/mock-test`

5. Test admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/courses`
- `/admin/mock-tests`
- `/admin/messages`

6. Test teacher

- `/teacher/courses`
- `/teacher/mock-tests`
- `/teacher/students`
- `/teacher/messages`

7. Test student

- `/student/my-courses`
- `/student/learn/:courseId`
- `/student/mock-tests`
- `/student/messages`
- `/student/profile`

## 14. Notes for future extension

Các điểm đã được mở đường để mở rộng:

- video storage hiện chỉ lưu metadata/url, chưa lưu binary
- `course` / `lesson` đã sẵn field để nâng cấp lên Cloudinary / S3 / Bunny / Vimeo private
- mock-test workspace đã đủ nền cho quiz/assignment phức tạp hơn
- inbox hiện đủ cho CRM nội bộ, có thể mở rộng thread hoặc attachment
- notification gateway hiện là in-process, có thể tách sang Redis/pub-sub nếu scale lớn hơn
