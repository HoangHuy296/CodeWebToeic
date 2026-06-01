# Runtime Data Audit

Current production-shaped runtime:

- `frontend + backend-spring + MySQL + Flyway + nginx`

## API-backed and live

Public pages that already render real backend data:

- `/courses`
- `/courses/:slug`
- `/mock-test`
- `/blog`
- `/blog/:slug`
- `/exercises`
- `/exercises/:topicSlug`

Workspace areas that already use real backend APIs:

- auth / JWT / refresh / me
- courses / lessons / review workflow
- enrollments / learning progress
- exercises / exercise results
- mock-tests / submissions / grading
- internal messages
- notifications / unread inbox
- admin stats / charts / users / posts

## Static marketing content by design

These routes are intentionally content-first and do not depend on API data:

- `/`
- `/portfolio`

## Legacy local/reference only

These files are no longer the primary runtime source for public pages:

- `frontend/src/lib/blog-content.ts`
- `frontend/src/lib/exercise-topics.ts`

Current status:

- they remain in the repo only as reference content during the transition
- runtime public pages read live API data instead
- if the team no longer needs them as editorial/reference assets, they can be removed in a later cleanup phase
