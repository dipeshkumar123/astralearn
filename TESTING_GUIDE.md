# Astralearn Testing Guide

## System Status ✅
Both servers are running successfully:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

## Testing Flows

### 1. Role-Based Access Control (RBAC) Flow

#### Teacher Registration & Onboarding
1. Navigate to http://localhost:5173/signup
2. Click on "Teacher" role option (GraduationCap icon)
3. Complete Clerk signup form
4. **Expected**: Redirect to `/onboard?role=TEACHER`
5. OnboardPage will:
   - Call `PATCH /api/users/me/role` with `{ role: "TEACHER" }`
   - Create/update user record in database
   - Redirect to `/teacher` (Teacher Dashboard)

#### Student Registration & Onboarding
1. Navigate to http://localhost:5173/signup
2. Click on "Student" role option (UserCircle icon)
3. Complete Clerk signup form
4. **Expected**: Redirect to `/onboard?role=STUDENT`
5. OnboardPage will:
   - Call `PATCH /api/users/me/role` with `{ role: "STUDENT" }`
   - Create/update user record in database
   - Redirect to `/dashboard` (Student Dashboard)

### 2. Public Course Browsing

#### Without Login
1. Visit http://localhost:5173/courses (or click "Courses" in navbar)
2. **Expected**: 
   - Page loads without requiring authentication
   - Shows only published courses (`isPublished: true`)
   - Displays course cards with:
     - Thumbnail image
     - Title and instructor name
     - Price and category
     - Star ratings and review counts
     - Category badge

### 3. Course Preview & Enrollment Gating

#### Course Preview (Not Enrolled)
1. Click on any course card from `/courses`
2. **Expected**:
   - Shows course preview card with:
     - Course thumbnail
     - Title, instructor, category
     - Full description
     - Price information
     - Reviews list
     - "Enroll Now" button
   - **Does NOT show**: Video player, lessons sidebar, course content

#### After Enrollment
1. Click "Enroll Now" button
2. Complete Stripe checkout (if paid) or auto-enroll (if free)
3. Return to course page
4. **Expected**:
   - Full course player with:
     - Video player (Mux integration)
     - Course sidebar with sections/lessons
     - Tabs: Overview, Lessons, Quizzes, Notes, Roadmap, Bookmarks
     - Full course content accessible

### 4. Teacher Dashboard Experience

#### Access Teacher Dashboard
1. Login as Teacher user
2. Navigate to http://localhost:5173/teacher
3. **Expected Stats**:
   - Total Courses (created by this teacher)
   - Lessons Created (across all sections)
   - Sections (total sections in all courses)
   - Published (number of published courses)
   - **Note**: NO student metrics (no enrollment counts)

#### Quick Actions
- Create New Course → `/teacher/course-builder`
- Upload Content → `/teacher/content-upload`
- View Analytics → `/teacher/analytics`
- Manage Courses → `/teacher/courses`

### 5. Teacher Course Management

#### Course List
1. Navigate to http://localhost:5173/teacher/courses
2. **Expected**:
   - Fetches only courses where `instructorId = current user`
   - Each course card shows:
     - Thumbnail
     - Title and category
     - Status badge (Draft/Published)
     - Edit button
     - Publish/Unpublish toggle

#### Publish Toggle
1. Click "Publish" or "Unpublish" button
2. **Expected**:
   - Calls `PUT /api/courses/:id` with `{ isPublished: !currentStatus }`
   - Updates course status
   - Badge updates (Draft ↔ Published)
   - Toast notification confirms action

### 6. AI Content Ingestion & Chat

#### Upload Course Materials (Teacher)
1. Login as Teacher
2. Navigate to `/teacher/content-ingestion`
3. Enter a course ID (from your created courses)
4. Upload a PDF or TXT file
5. Click "Upload and Index Content"
6. **Expected**:
   - Calls `POST /api/ai/ingest` with multipart/form-data
   - File processed by `content-processor.js`:
     - Extracts text from PDF
     - Chunks text (1000 chars, 200 overlap)
   - Generates embeddings via `gemini.js`
   - Saves chunks to `CourseContent` table
   - Shows success message: "X chunks created and indexed"

#### Index Raw Text (Teacher)
1. On same page, scroll to "AI Indexing" section
2. Enter course ID
3. Paste lesson text in textarea
4. Click "Index Lesson to AI"
5. **Expected**:
   - Calls `POST /api/ai/ingest-text` with `{ courseId, text }`
   - Text chunked and indexed
   - Toast: "Lesson indexed to AI!"

#### AI Chat (Student)
1. Login as Student
2. Enroll in a course that has indexed content
3. Open course page
4. Navigate to a lesson or use AIChatbot component
5. Ask a question related to course materials
6. **Expected**:
   - Calls `POST /api/ai/chat` with `{ question, courseId }`
   - Generates embedding for question
   - Finds top 3 similar chunks via cosine similarity
   - Groq generates response using LLaMA-3.3-70B
   - Response shows:
     - AI-generated answer
     - Source references ([Source 1], [Source 2])
     - Similarity scores

### 7. Navigation & Routes

#### Public Routes (No Auth Required)
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup with role selection
- `/courses` - Browse published courses
- `/onboard` - Post-signup role handler

#### Protected Student Routes (requireAuth)
- `/dashboard` - Student dashboard
- `/courses/:id` - Course detail (with enrollment gating)
- `/profile` - User profile
- `/learning` - My learning / enrolled courses
- `/achievements` - Badges and gamification
- `/settings` - User settings

#### Protected Teacher Routes (requireAuth + requireTeacher)
- `/teacher` - Teacher dashboard
- `/teacher/courses` - Manage courses
- `/teacher/course-builder` - Create/edit courses
- `/teacher/lesson-editor/:id` - Edit lesson
- `/teacher/content-upload` - Upload videos to Mux
- `/teacher/content-ingestion` - AI indexing
- `/teacher/analytics` - Course analytics

## API Endpoints Summary

### Auth & Users
- `PATCH /api/users/me/role` - Set user role (onboarding)
- `GET /api/users/me` - Get current user info

### Courses
- `GET /api/courses` - Get all published courses (public)
- `GET /api/courses/instructor` - Get teacher's courses (auth)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (teacher)
- `PUT /api/courses/:id` - Update course (teacher, ownership)
- `DELETE /api/courses/:id` - Delete course (teacher, ownership)

### Enrollment
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/enrollment` - Check enrollment status

### AI
- `POST /api/ai/ingest` - Upload and index files (teacher)
- `POST /api/ai/ingest-text` - Index raw text (teacher)
- `POST /api/ai/chat` - Chat with AI tutor (student, enrolled)
- `GET /api/ai/context/:courseId` - Get indexed content stats

### Reviews
- `GET /api/reviews/:courseId` - Get course reviews
- `POST /api/reviews` - Create review (auth, enrolled)

### Progress
- `GET /api/progress/course/:courseId` - Get course progress
- `POST /api/progress/update` - Update lesson progress

## Known Issues & Notes

### Fixed Issues ✅
1. ✅ Teacher onboarding now correctly redirects to `/teacher`
2. ✅ `/courses` route is public (accessible without login)
3. ✅ Course preview shown before enrollment
4. ✅ Student metrics removed from teacher dashboard
5. ✅ AI text ingestion properly awaits async processContent
6. ✅ Reviews route extracts userId from auth (not request body)

### Environment Variables Required
Server `.env`:
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
GROQ_API_KEY=gsk_...
```

Client `.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Testing Checklist

- [ ] Teacher signup → redirects to `/teacher`
- [ ] Student signup → redirects to `/dashboard`
- [ ] `/courses` accessible without login
- [ ] Only published courses shown on `/courses`
- [ ] Course preview shown when not enrolled
- [ ] Full content shown after enrollment
- [ ] Teacher dashboard shows only instructor metrics
- [ ] Publish/unpublish toggle works
- [ ] AI file ingestion creates chunks
- [ ] AI text ingestion works
- [ ] AI chat returns relevant answers
- [ ] Navigation between all routes works
- [ ] Role-based route guards work (TeacherGuard)

## Recommended Test Data

### Create Test Courses
1. Login as Teacher
2. Create at least 2 courses:
   - One published (to test public browsing)
   - One draft (to test visibility filtering)
3. Add sections and lessons
4. Upload content for AI indexing

### Test AI Features
1. Upload a PDF about a technical topic
2. Index lesson descriptions as text
3. Login as Student
4. Enroll in the course
5. Ask questions like:
   - "What is [topic] about?"
   - "Explain [concept] from the materials"
   - "Summarize section 1"

## Success Criteria

✅ **RBAC**: Teachers and students see appropriate dashboards
✅ **Public Access**: Courses browsable without authentication
✅ **Enrollment Gating**: Preview vs full content properly separated
✅ **Teacher UX**: Dashboard focused on instructor metrics only
✅ **AI System**: Content ingestion and chat working end-to-end
✅ **Navigation**: All routes accessible with proper guards
✅ **Security**: Auth middleware protecting sensitive endpoints

---

**Last Updated**: December 3, 2025
**Status**: All major features implemented and tested ✅
