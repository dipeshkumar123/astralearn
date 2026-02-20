# AstraLearn API Reference

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <clerk-jwt-token>
```

---

## 📚 Course Endpoints

### GET /api/courses
Get all published courses with optional filtering
```javascript
// Query params (optional)
?search=keyword
&category=Development
&level=Beginner

// Response
[
  {
    id: "uuid",
    title: "Course Title",
    description: "...",
    thumbnail: "url",
    price: 0,
    category: "Development",
    level: "Beginner",
    isPublished: true,
    sections: [...],
    enrollments: [...]
  }
]
```

### GET /api/courses/my-courses
Get authenticated user's enrolled courses
```javascript
// Headers: Authorization required
// Response
[
  {
    id: "uuid",
    title: "...",
    // ... full course data with sections
  }
]
```

### GET /api/courses/:id
Get single course details
```javascript
// Response
{
  id: "uuid",
  title: "...",
  sections: [
    {
      id: "uuid",
      title: "...",
      lessons: [...]
    }
  ]
}
```

### GET /api/courses/:id/enrollment-status
Check if current user is enrolled in a course
```javascript
// Headers: Authorization required
// Response
{
  enrolled: true,
  purchased: true
}
```

### POST /api/courses
Create a new course (Teacher only)
```javascript
// Headers: Authorization required
// Request
{
  title: "Course Title"
}

// Response
{
  id: "uuid",
  title: "...",
  instructorId: "auto-assigned-from-token",
  // ...
}
```

### POST /api/courses/:id/enroll
Enroll in a course
```javascript
// Headers: Authorization required
// For free courses: instant enrollment
// For paid courses: requires prior purchase

// Response
{
  id: "enrollment-uuid",
  userId: "...",
  courseId: "...",
  progress: 0
}
```

### PATCH /api/courses/:id
Update course (Owner only)
```javascript
// Headers: Authorization required
// Request
{
  title: "New Title",
  description: "...",
  price: 29.99,
  // ... any course fields
}
```

### DELETE /api/courses/:id
Delete course (Owner only)
```javascript
// Headers: Authorization required
// Response
{ message: 'Course deleted' }
```

---

## 📊 Progress Endpoints

### GET /api/progress/course/:courseId
Get user's progress for a course
```javascript
// Headers: Authorization required
// Response
[
  {
    id: "uuid",
    userId: "...",
    lessonId: "...",
    isCompleted: true,
    lesson: {
      id: "...",
      title: "..."
    }
  }
]
```

### POST /api/progress/lesson/:lessonId
Mark lesson as complete
```javascript
// Headers: Authorization required
// Request body: {} (empty)

// Response
{
  id: "uuid",
  userId: "auto-from-token",
  lessonId: "...",
  isCompleted: true
}
```

### DELETE /api/progress/lesson/:lessonId
Unmark lesson (mark as incomplete)
```javascript
// Headers: Authorization required
// Response
{ message: 'Progress removed' }
```

---

## 📝 Quiz Endpoints

### GET /api/quizzes/:id
Get quiz with questions
```javascript
// Query params (optional)
?includeAnswers=true  // For review mode

// Response
{
  id: "uuid",
  title: "...",
  passingScore: 70,
  timeLimit: 30,
  questions: [
    {
      id: "uuid",
      type: "multiple_choice",
      question: "...",
      options: ["A", "B", "C"],
      // correctAnswer only if includeAnswers=true
    }
  ]
}
```

### POST /api/quizzes/:id/attempt
Submit quiz attempt
```javascript
// Headers: Authorization required
// Request
{
  answers: {
    "question-id-1": "answer",
    "question-id-2": "answer"
  },
  timeSpent: 900  // seconds
}

// Response
{
  attemptId: "uuid",
  score: 85.5,
  passed: true,
  results: {
    "question-id": {
      correct: true,
      userAnswer: "...",
      correctAnswer: "..."
    }
  },
  earnedPoints: 17,
  totalPoints: 20
}
```

### GET /api/quizzes/:id/results
Get quiz results for current user
```javascript
// Headers: Authorization required
// Response
[
  {
    id: "attempt-uuid",
    score: 85.5,
    passed: true,
    answers: {...},
    completedAt: "2025-11-27T..."
  }
]
```

### POST /api/quizzes
Create quiz (Teacher only)
```javascript
// Headers: Authorization required
// Request
{
  lessonId: "uuid",
  title: "Quiz Title",
  description: "...",
  passingScore: 70,
  timeLimit: 30
}
```

### POST /api/quizzes/:id/questions
Add question to quiz
```javascript
// Headers: Authorization required
// Request
{
  type: "multiple_choice",
  question: "What is...?",
  options: ["A", "B", "C"],
  correctAnswer: "A",
  explanation: "...",
  order: 1,
  points: 1
}
```

---

## 🤖 AI Endpoints

### POST /api/ai/chat
Chat with AI tutor
```javascript
// Headers: Authorization required
// Request
{
  courseId: "uuid",
  question: "What is React?"
}

// Response
{
  answer: "React is...",
  sources: [
    {
      content: "...",
      chunkIndex: 0
    }
  ],
  messageId: "uuid"
}
```

### POST /api/ai/ingest
Ingest course content for AI (Teacher only)
```javascript
// Headers: Authorization required
// Request: multipart/form-data
{
  file: <File>,
  courseId: "uuid",
  contentType: "pdf"
}

// Response
{
  message: "Content ingested successfully",
  chunksCreated: 42
}
```

### GET /api/ai/context/:courseId
Get indexed content stats
```javascript
// Response
{
  totalChunks: 42,
  contentTypes: [
    { type: "pdf", count: 20 },
    { type: "text", count: 22 }
  ]
}
```

---

## 💳 Stripe Endpoints

### POST /api/stripe/checkout
Create checkout session for course purchase
```javascript
// Headers: Authorization required
// Request
{
  courseId: "uuid"
}

// Response
{
  url: "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook
Stripe webhook handler (internal)
```javascript
// Called by Stripe after successful payment
// Automatically creates Purchase and Enrollment
```

---

## 👤 User Endpoints

### GET /api/users/me
Get or create current user
```javascript
// Headers: Authorization required
// Response
{
  id: "uuid",
  clerkId: "clerk-user-id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "STUDENT",
  stripeCustomerId: "cus_..."
}
```

### GET /api/users/:userId/stats
Get user statistics
```javascript
// Response
{
  avgScore: 85,
  hoursLearned: "12.5",
  completedCourses: 3,
  currentStreak: 5
}
```

---

## 📚 Section & Lesson Endpoints

### GET /api/sections/course/:courseId
Get all sections for a course
```javascript
// Response
[
  {
    id: "uuid",
    title: "Section 1",
    position: 1,
    lessons: [...]
  }
]
```

### POST /api/sections
Create section (Teacher only)
```javascript
// Headers: Authorization required
// Request
{
  courseId: "uuid",
  title: "Section Title",
  position: 1
}
```

### POST /api/lessons
Create lesson (Teacher only)
```javascript
// Headers: Authorization required
// Request
{
  sectionId: "uuid",
  courseId: "uuid",
  title: "Lesson Title",
  description: "...",
  position: 1,
  isFree: false
}
```

---

## 💬 Discussion Endpoints

### GET /api/discussions/lesson/:lessonId
Get discussions for a lesson

### POST /api/discussions
Create discussion

### POST /api/discussions/:id/replies
Add reply to discussion

---

## ⭐ Review Endpoints

### GET /api/reviews/course/:courseId
Get reviews for a course

### GET /api/reviews/stats/:courseId
Get review statistics

### POST /api/reviews
Submit a review
```javascript
// Headers: Authorization required
// Request
{
  courseId: "uuid",
  rating: 5,
  comment: "Great course!"
}
```

---

## 🎥 Mux Video Endpoints

### POST /api/mux/upload-url
Get upload URL for video (Teacher only)
```javascript
// Headers: Authorization required
// Response
{
  uploadId: "...",
  uploadUrl: "https://storage.mux.com/..."
}
```

### GET /api/mux/asset/:assetId
Get asset details

### DELETE /api/mux/asset/:assetId
Delete video asset

---

## Error Responses

All endpoints return errors in this format:
```javascript
{
  error: "ERROR_CODE",
  message: "Human readable message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not enough permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Flow

1. User signs in via Clerk
2. Frontend gets JWT token: `await getToken()`
3. Include token in requests: `Authorization: Bearer <token>`
4. Backend validates token and extracts user info
5. User ID and role automatically assigned to request

---

## Role-Based Access

- **Public**: Browse courses, view published content
- **STUDENT**: Enroll, track progress, take quizzes
- **TEACHER**: Create courses, manage content, view analytics

Middleware:
- `requireAuth()` - Any authenticated user
- `requireTeacher()` - Teacher role only
- `requireEnrollment()` - Enrolled students or course owner
- `requireCourseOwnership()` - Course owner only
