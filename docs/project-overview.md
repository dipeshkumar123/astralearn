# Astralearn Project Overview

Last updated: 2025-11-30

## High-Level Architecture

- Frontend: React 18 app (Vite + Tailwind) in `client/` using Clerk for auth, Stripe for payments UI, Mux Player for video, TipTap editor, and a component library in `src/components/ui`.
- Backend: Node.js Express server in `server/` with Prisma ORM targeting PostgreSQL. Auth via Clerk middleware, AI features via Groq SDK and a custom embedding generator, video via Mux, payments via Stripe. REST endpoints under `/api/*`.
- Database: PostgreSQL via Prisma. Models include `User`, `Course`, `Section`, `Lesson`, `Enrollment`, `Purchase`, `Progress`, `Review`, `Discussion`, `DiscussionReply`, `Quiz`, `Question`, `QuizAttempt`, `CourseContent`, `ChatMessage`.

## Repos & Important Paths

- Root: `.env`, `README.md`, `plan.md`, `schema.prisma.backup`.
- Server: `server/package.json`, `server/prisma/schema.prisma`, `server/src/index.js`, routes under `server/src/routes`, Prisma client at `server/src/lib/prisma.js`.
- Client: `client/package.json`, `client/src/App.jsx`, `client/src/pages/*`, `client/src/components/*`, axios config at `client/src/lib/axios.js`.

## Backend Details

- Entry: `server/src/index.js`
  - Loads env `../.env`, sets CORS for `http://localhost:5173`, `express.json`, `clerkMiddleware`.
  - Routes: `/api/{courses,sections,lessons,mux,progress,ai,quizzes,users,reviews,discussions,stripe}`.
  - Health: `GET /api/health`.

- Auth Middleware: `server/src/middleware/auth.js`
  - `requireAuth()`: Checks `req.auth().userId` set by Clerk.
  - `requireTeacher()`: Requires `User.role === 'TEACHER'`.
  - `requireEnrollment(courseIdParam)`: Ensures enrollment or instructor.
  - `requireCourseOwnership(courseIdParam)`: Ensures requesting user is instructor for course.

- Prisma: `server/src/lib/prisma.js` exports a singleton `PrismaClient`.

- Routes Summary
  - Courses (`/api/courses`):
    - `GET /` List published courses with optional `search`, `category`, `level`; includes sections->lessons and `_count.enrollments`.
    - `GET /my-courses` Auth: current user’s enrolled courses (via enrollments include).
    - `GET /instructor` Auth: list courses where current user is instructor.
    - `GET /:id` Single course with sections->lessons ordered, instructor, `_count.enrollments`.
    - `POST /` Auth+Teacher: create course.
    - `PUT/PATCH /:id` Auth+Ownership: update course.
    - `DELETE /:id` Auth+Ownership: delete course.
    - `POST /:id/enroll` Auth: enroll; requires purchase if `price>0`.
    - `GET /:id/enrollment-status` Auth: returns `{ enrolled, purchased }`.
  - Sections (`/api/sections`):
    - `GET /course/:courseId` list sections with lessons ordered.
    - `POST /` create with position (+1 of max).
    - `PATCH /:id`, `DELETE /:id`, `POST /reorder` update/reorder/delete.
    - Note: No auth checks present here; suggest adding ownership checks.
  - Lessons (`/api/lessons`):
    - `GET /section/:sectionId`, `GET /:id`.
    - `POST /` create with positioned ordering; requires `courseId`.
    - `PATCH /:id`, `DELETE /:id`.
    - Note: No auth/ownership checks; suggest adding.
  - Progress (`/api/progress`):
    - `GET /course/:courseId` Auth: all progress for current user within course.
    - `POST /lesson/:lessonId` Auth: mark complete via upsert.
    - `DELETE /lesson/:lessonId` Auth: unmark.
  - Quizzes (`/api/quizzes`):
    - `POST /` Auth: create quiz for a lesson.
    - `GET /:id` with `includeAnswers` to include `correctAnswer`/`explanation`.
    - `GET /lesson/:lessonId` list quizzes with counts.
    - `PATCH /:id`, `DELETE /:id` update/delete quiz.
    - `POST /:id/questions` add question; `PATCH /questions/:id`; `DELETE /questions/:id`.
    - `POST /:id/attempt` Auth: grade and save attempt.
    - `GET /:id/results` Auth: attempts for current user.
  - Users (`/api/users`):
    - `GET /me` Auth: upsert user from Clerk claims; includes enrollments->courses.
    - `GET /:userId/stats` statistics (avgScore, hoursLearned, completedCourses, streak/points/badges).
    - `GET /leaderboard` top students by points.
  - Reviews (`/api/reviews`):
    - `GET /course/:courseId` list with user info.
    - `GET /stats/:courseId` average + count.
    - `POST /` Auth: create review, checks enrollment; one review per user per course.
  - Discussions (`/api/discussions`):
    - `GET /lesson/:lessonId` list with users and replies.
    - `POST /` Auth: create discussion; `POST /:id/reply` Auth: reply.
    - `DELETE /:id` Auth: author or TEACHER/ADMIN can delete.
  - Mux (`/api/mux`):
    - `POST /upload-url` create signed upload URL.
    - `GET /asset/:assetId` retrieve asset; `DELETE /asset/:assetId` delete.
  - Stripe (`/api/stripe`):
    - `POST /checkout` Auth: create checkout session; creates Stripe customer if needed; returns `session.url`.
    - `POST /webhook` raw body expected; on `checkout.session.completed` creates `Purchase` and `Enrollment`.
  - AI (`/api/ai`):
    - `POST /ingest` multer upload (pdf/text) → chunk, embed, store in `CourseContent`.
    - `POST /chat` embed question → retrieve top 3 by cosine → Groq LLM answer → save `ChatMessage`.
    - `GET /context/:courseId` chunk stats by contentType.

## Database Schema Highlights (Prisma)

- Users link to Clerk via `clerkId` and have gamification fields `points`, `streak`, `badges`.
- Courses have instructor relation, sections, lessons, enrollments, reviews, purchases.
- `Progress` unique on (`userId`, `lessonId`).
- Quizzes structure with `Question` and `QuizAttempt` linked to `User`.
- `CourseContent` stores text chunks and `embedding` stringified for AI retrieval.
- `ChatMessage` stores Q/A and sources JSON.

## Frontend Details

- Router: `client/src/App.jsx` with Public (Landing, Auth), Student (Dashboard, CoursePage, Profile), Teacher (Dashboard, Courses, CourseBuilder, LessonEditor, ContentIngestion, Analytics). Clerk guards via `<SignedIn/SignedOut>`.
- Axios: `client/src/lib/axios.js` sets `axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''` and basic interceptors. Auth token is manually added per request via Clerk’s `getToken()` in components.
- CoursePage: Fetches `GET /api/courses/:courseId`, plays video via `VideoPlayer` (mux playback), has tabs: overview, notes, reviews (form + list), and AI tutor (`AIChatbot`). Sidebar displays curriculum via `CourseSidebar`.
- Quizzes: `QuizPlayer` loads quiz with `/api/quizzes/:id`, posts attempts to `/api/quizzes/:id/attempt`, displays detailed results.
- AI: `AIChatbot` posts to `/api/ai/chat` with course context; displays streamed chat-like UI.
- Teacher: `ContentIngestion` uploads PDFs/TXT to `/api/ai/ingest`; `VideoUpload` integrates with Mux upload URL and removal endpoints.

## Environment Variables (expected)

- Database: `DATABASE_URL` (PostgreSQL)
- Clerk: `CLERK_PUBLISHABLE_KEY` (client), `CLERK_SECRET_KEY` (server)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and frontend `VITE_STRIPE_PUBLISHABLE_KEY` if needed
- Mux: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
- AI: `GROQ_API_KEY`
- Frontend URL: `FRONTEND_URL` (used in Stripe success/cancel URLs)

Note: Server loads env from `../.env` relative to `server/src/index.js`, implying root `.env`.

## Local Setup & Run (Windows PowerShell)

```powershell
# From repo root
cd server; npm install; npm run prisma:generate; npm run prisma:push; cd ..
cd client; npm install; cd ..

# Start backend (in one terminal)
cd server; npm run dev

# Start frontend (in another terminal)
cd client; npm run dev
```

Ensure `.env` in repo root includes all required secrets and `DATABASE_URL`.

## Identified Gaps / Risks

1) Auth gaps on write endpoints:
   - `sections` and `lessons` routes allow create/update/delete without `requireAuth` or ownership checks. Suggest adding `requireAuth()` and `requireCourseOwnership()`.

2) Client/Server data mismatches:
   - `CoursePage` expects `response.data.lessons` and uses `currentLesson?._id`; server returns sections with nested lessons and Prisma uses `id` (not `_id`). Sidebar also references `_id`.
   - `AIChatbot` expects `source.contentType` and `source.similarity`, but `/api/ai/chat` returns sources with only `content` (snippet) and `chunkIndex`. UI will show undefined similarity/type.
   - `QuizPlayer` uses `quiz._id` fallback when submitting; server identifiers are `id`.

3) CORS is hardcoded to `http://localhost:5173`; consider env-configured origins for prod.

4) Stripe webhook parsing:
   - Using `express.raw({ type: 'application/json' })` on that route only is good, but the server globally uses `express.json()`. Ensure route order keeps raw body before JSON middleware for the webhook path, or separate app for webhook.

5) AI embeddings:
   - `generateEmbedding` uses a simplistic word-frequency hash; adequate for demo but not semantically meaningful. Consider real embedding service (OpenAI, Cohere, VoyageAI, etc.) or open-source embedding service with pgvector.

6) Security:
   - `Mux` routes are unauthenticated; upload & delete actions should require teacher ownership.
   - `Stripe` checkout relies on Clerk auth; verify role and course access.

7) Error handling & validation:
   - Minimal zod validation in server; recommend adding request validation schemas.

## Quick Fix Recommendations

- Add `requireAuth()` and `requireCourseOwnership('courseId')` to sections/lessons mutations.
- Normalize identifiers on client: use `id` everywhere; flatten lessons in client or adapt to sections->lessons.
- Update `/api/ai/chat` to include `contentType` and `similarity` in `sources`, or adjust UI to available fields.
- Parameterize CORS and base URLs via env.
- Consider moving `dotenv.config` to load root `.env` robustly and ensure it loads before route files initialize.

## Try-It Checklist

1) Create DB and `.env` with `DATABASE_URL`, Clerk, Stripe, Mux, Groq.
2) `npm run prisma:push` then start server.
3) Visit `http://localhost:5173` (ensure `VITE_API_URL` points to server base, e.g. `http://localhost:5000`).
4) Sign up/sign in via Clerk.
5) Create a course (teacher role required) and sections/lessons.
6) Upload video via teacher UI; verify Mux playback.
7) Ingest content via Content Ingestion and test AI Tutor on Course Page.
8) Create quiz and attempt; verify grading and progress.

---

This document captures the current state for onboarding, planning fixes, and future development.
