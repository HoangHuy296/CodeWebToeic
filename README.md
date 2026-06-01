# IVYTS 1997 E-Learning CRM

This repo now runs on a single primary stack:

- `frontend/`: React + Vite + TypeScript
- `backend-spring/`: Spring Boot API
- `MySQL`: primary runtime database
- `Flyway`: schema and seed migrations
- `nginx`: public entrypoint and reverse proxy

The legacy Node backend is no longer part of the active runtime path.

## Canonical Run Path

The recommended developer path is the Docker stack driven by `Makefile`.

### Start the app

```bash
make up
```

This boots:

- `frontend`
- `backend`
- `mysql`
- `nginx`

Main URLs:

- Web app: `http://localhost`
- Backend direct: `http://localhost:5000`
- Health via nginx: `http://localhost/api/health`
- MySQL host port: `3307`

### Stop the app

```bash
make down
```

### View logs

```bash
make logs
```

## Convenience npm Commands

`npm` commands stay in the repo for smoke tests and frontend/backend build helpers.

### Main stack

```bash
npm run dev
npm run dev:clean
```

- `npm run dev`: rebuilds and starts the canonical stack
- `npm run dev:clean`: drops the MySQL volume, then rebuilds and starts the stack

### Build helpers

```bash
npm run build:frontend
npm run build:backend-spring
```

### Seed, cleanup, smoke, regression

```bash
npm run seed
npm run cleanup:regression
npm run smoke:guest
npm run smoke:student
npm run smoke:teacher
npm run smoke:teacher:exercise
npm run smoke:admin
npm run smoke:google
npm run regression:spring-stack
```

## Architecture

Request flow:

```text
browser
  -> nginx
    -> frontend
    -> backend-spring
      -> MySQL
         -> Flyway-managed schema
```

### Public runtime behavior

- `/`, `/portfolio`
  - static/marketing by design
- `/courses`, `/courses/:slug`
  - live API data
- `/blog`, `/blog/:slug`
  - live API data
- `/mock-test`
  - live API data
- `/exercises`, `/exercises/:topicSlug`
  - live API data

See [docs/runtime-data-audit.md](docs/runtime-data-audit.md) for the current API-backed vs static/runtime-reference split.

## Role Model

Active application roles:

- `student`
- `teacher`
- `admin`

### Student

- can browse public courses, exercises, mock-tests, posts
- can enroll in courses
- can learn lessons and track progress
- can submit exercises and mock-tests
- can view personal results
- cannot access admin stats
- cannot create posts or mock-tests
- cannot message another student directly

### Teacher

- can create and update owned courses
- new courses stay in `pending_review`
- cannot self-publish courses
- can CRUD owned lessons
- can CRUD exercises and mock-tests in teacher workspace
- can message allowed recipients
- cannot access admin-only stats
- cannot create public blog posts

### Admin

- can review and publish courses
- can manage users
- can CRUD posts that appear on `/blog`
- can CRUD exercise topics and exercise items that appear on `/exercises`
- can view global results, notifications, stats, and charts

## Database Layout

Flyway migrations live under:

- `backend-spring/src/main/resources/db/migration/mysql`

Main table groups:

### Users and auth

- `users`

Stores:

- local email/password accounts
- Google-linked accounts
- role and profile data
- refresh-token-related auth state

### Courses and lessons

- `courses`
- `lessons`

Stores:

- course catalog
- review workflow
- lesson ordering and media metadata

### Learning and enrollment

- `enrollments`
- `enrollment_lesson_progress`

Stores:

- enroll state
- completed lessons
- watched seconds
- computed progress

### Testing and practice

- `mock_tests`
- `mock_test_questions`
- `mock_test_question_options`
- `test_submissions`
- `test_submission_answers`
- `exercise_topics`

Stores:

- exam-style mock tests
- exercise-backed practice items
- questions, options, answers
- submission scores and review data

### Content and communication

- `blog_posts`
- `messages`
- `notifications`

Stores:

- public articles shown on `/blog`
- internal messaging
- unread notification inbox persistence

### Admin and commerce support

- `orders`

Used by:

- revenue charting
- dashboard aggregates

## Flyway Rules

The repo should follow these rules from now on:

1. Do not edit old migrations after they have been applied outside local throwaway databases.
2. Add new schema or seed changes in a new versioned migration.
3. Keep schema changes additive whenever possible.
4. Distinguish clearly between:
   - durable seed data for development/demo
   - smoke/regression data that can be cleaned up
5. If a migration must evolve user auth behavior, update:
   - entity mapping
   - store mapping
   - auth service logic
   - docs and smoke coverage

## Google Sign-In

This phase uses:

- Google Identity Services popup on the frontend
- backend ID-token verification in Spring

It does **not** use Spring server-side redirect login.

### Supported roles

- `student`
- `teacher`

`admin` stays local email/password only.

### Current linking policy

If a Google email matches an existing local account:

- the backend does **not** auto-link
- the backend returns `409 GOOGLE_LINK_REQUIRED`
- the frontend tells the user to sign in with password first

### Google-only accounts

New Google-created users are created as Google-first accounts:

- `password_hash` is nullable
- password login on those accounts returns a clear Google sign-in message

## Environment

### Backend example

See:

- `backend-spring/.env.example`

Important values:

```env
PORT=5000
MYSQL_URL=jdbc:mysql://127.0.0.1:3307/ivyts_1997?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
CLIENT_URL=http://localhost:5173,http://localhost
JWT_ACCESS_SECRET=replace-me1
JWT_REFRESH_SECRET=replace-me
GOOGLE_CLIENT_ID=
```

### Frontend example

See:

- `frontend/.env.example`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

## Google Cloud Console Setup

To use Google Sign-In locally:

1. Create or open a Google Cloud project.
2. Enable the Google Identity / OAuth consent flow for your app.
3. Create a Web OAuth client.
4. Add authorized JavaScript origins such as:
   - `http://localhost`
   - `http://localhost:5173`
5. Copy the client ID into:
   - backend `GOOGLE_CLIENT_ID`
   - frontend `VITE_GOOGLE_CLIENT_ID`

For this popup + ID-token flow, backend CORS only needs the app origins. The backend does not need special CORS rules for Google domains.

## Runtime Audit

### API-backed and live

- `/courses`
- `/courses/:slug`
- `/blog`
- `/blog/:slug`
- `/mock-test`
- `/exercises`
- `/exercises/:topicSlug`
- auth, messages, notifications, admin dashboards, results, learning

### Static by design

- `/`
- `/portfolio`

### Legacy local/reference only

- `frontend/src/lib/blog-content.ts`
- `frontend/src/lib/exercise-topics.ts`

These files are still in the repo as editorial/reference assets, but they are not the primary runtime source for the public pages listed above.

## Smoke Status on Current Stack

The current baseline smoke on `guest`, `student`, `teacher`, and `admin` passes on the canonical stack.

Highlights:

- `guest`
  - public routes return `200`
  - public API data renders on `/courses`, `/blog`, `/mock-test`, `/exercises`
- `student`
  - login, learning, exercise submit, mock-test submit, notifications all work
  - admin/post/mock-test/student-to-student restrictions are enforced
- `teacher`
  - course creation remains `pending_review`
  - teacher cannot self-publish
  - lesson CRUD, exercise CRUD, and mock-test CRUD work on owned content
- `admin`
  - stats, charts, users, posts, messages, notifications, content moderation all work

Google auth contract checks also pass:

- `admin` Google sign-in is blocked with `403 GOOGLE_ROLE_NOT_ALLOWED`
- malformed or fake Google ID token returns `401 GOOGLE_TOKEN_INVALID`
- unsupported Google role returns `400 GOOGLE_ROLE_INVALID`

The remaining Google success-path validation still requires a real browser popup sign-in with an allowed Google account.

## Sample Accounts

- Admin: `admin@ivyts.dev / Password@123`
- Teacher 1: `teacher@ivyts.dev / Password@123`
- Teacher 2: `teacher2@ivyts.dev / Password@123`
- Student 1: `student1@ivyts.dev / Password@123`
- Student 3: `student3@ivyts.dev / Password@123`

## Development Notes

- The stack currently binds backend direct access to `http://localhost:5000`.
- `nginx` proxies `/api` and `/ws/notifications` for browser usage through `http://localhost`.
- `cleanup` helpers may be skipped if the shell cannot use Docker CLI directly; this does not invalidate role smoke results, but it can leave extra smoke data in MySQL.
