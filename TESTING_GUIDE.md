# AstraLearn - Comprehensive Testing Guide

## Overview
This document outlines all test files created for the AstraLearn application, covering both backend and frontend functionality with focus on updated features including role-based access control, course ownership security, video uploads, and AI content ingestion.

## Backend Tests

### 1. Authentication & Security Tests (`server/tests/auth-security.test.js`)
Tests critical security features and authentication flows.

**Key Test Cases:**
- ✅ Auto-user creation on first API call with unique email format
- ✅ 401 Unauthorized without proper Bearer token
- ✅ Course ownership verification - teachers can only edit their own courses
- ✅ AI content ingestion security - teachers cannot index to courses they don't own
- ✅ Role-based access control (STUDENT vs TEACHER)
- ✅ Proper 403 Forbidden responses for unauthorized access

**Run Command:**
```bash
cd server
npm test -- auth-security.test.js
```

### 2. Course Management Tests (`server/tests/courses.test.js`)
Tests all course CRUD operations with ownership validation.

**Key Test Cases:**
- ✅ GET /api/courses/instructor returns teacher's courses only
- ✅ Empty array returned for teachers with no courses (not 404)
- ✅ POST /api/courses creates new course with correct instructorId
- ✅ Title validation required
- ✅ PUT /api/courses/:id enforces course ownership
- ✅ DELETE /api/courses/:id prevents unauthorized deletion
- ✅ 403 Forbidden when non-owner tries to modify

**Run Command:**
```bash
cd server
npm test -- courses.test.js
```

### 3. Video Upload & Mux Integration Tests (`server/tests/video-upload.test.js`)
Tests video upload workflow and Mux API integration.

**Key Test Cases:**
- ✅ POST /api/mux/upload-url generates upload URL for teachers
- ✅ Rejects upload if teacher doesn't own course (403)
- ✅ Validates courseId parameter required (400)
- ✅ Returns 404 for non-existent courses
- ✅ GET /api/mux/asset/:assetId retrieves asset status
- ✅ DELETE /api/mux/asset/:assetId removes video and clears lesson fields
- ✅ Ownership verification on delete operations

**Run Command:**
```bash
cd server
npm test -- video-upload.test.js
```

### 4. AI Content Ingestion Tests (`server/tests/ai-ingestion.test.js`)
Tests AI content indexing with security and validation.

**Key Test Cases:**
- ✅ POST /api/ai/ingest-text ingests text to owned courses
- ✅ 403 Forbidden when user doesn't own course
- ✅ courseId validation (400 if missing)
- ✅ 404 when course not found
- ✅ POST /api/ai/ingest (file upload) with ownership check
- ✅ PDF and text file support
- ✅ Content chunking and embedding generation
- ✅ POST /api/ai/chat returns AI responses for student queries

**Run Command:**
```bash
cd server
npm test -- ai-ingestion.test.js
```

### 5. Teacher Workflow Integration Tests (`server/tests/integration/teacher-workflow.integration.test.js`)
End-to-end workflow testing for complete teacher scenarios.

**Key Test Cases:**
- ✅ Complete workflow: user creation → course creation → video upload → content ingestion → publish
- ✅ Cross-teacher access prevention - no unauthorized course modification
- ✅ Prevent students from creating courses
- ✅ Prevent students from uploading videos
- ✅ Prevent students from ingesting content
- ✅ Course selector returns teacher's courses with proper fields
- ✅ Unique email format for new users
- ✅ Error handling: missing auth, invalid IDs, not found

**Run Command:**
```bash
cd server
npm test:integration -- teacher-workflow
```

## Frontend Tests

### 1. RoleBasedRedirect Component Tests (`client/src/__tests__/RoleBasedRedirect.test.jsx`)
Tests role-based post-login redirect functionality.

**Key Test Cases:**
- ✅ Redirects TEACHER role to /teacher
- ✅ Redirects STUDENT role to /dashboard
- ✅ Shows loading state initially
- ✅ Handles API errors gracefully with fallback redirect

**Run Command:**
```bash
cd client
npm test -- RoleBasedRedirect.test.jsx
```

### 2. VideoUpload Component Tests (`client/src/__tests__/VideoUpload.test.jsx`)
Tests video upload component with Mux integration.

**Key Test Cases:**
- ✅ Renders upload area when no video uploaded
- ✅ Includes Authorization Bearer token in upload request
- ✅ Displays MuxPlayer when video exists
- ✅ Allows video removal with confirmation
- ✅ Rejects non-video files with error toast
- ✅ Includes Bearer token in delete requests
- ✅ Proper Content-Type headers for file upload
- ✅ Handles upload errors gracefully

**Run Command:**
```bash
cd client
npm test -- VideoUpload.test.jsx
```

### 3. ContentIngestion Component Tests (`client/src/__tests__/ContentIngestion.test.jsx`)
Tests AI content indexing page functionality.

**Key Test Cases:**
- ✅ Fetches teacher's courses on mount with auth header
- ✅ Shows loading state while fetching
- ✅ Displays empty state for teachers with no courses
- ✅ Auto-selects first course in dropdown
- ✅ Allows file selection with drag-and-drop
- ✅ Disables upload button until file selected
- ✅ Sends upload request with Authorization header
- ✅ Displays course titles with (Published) or (Draft) badges
- ✅ Handles upload errors with specific error messages
- ✅ Supports text indexing alongside file upload

**Run Command:**
```bash
cd client
npm test -- ContentIngestion.test.jsx
```

### 4. TeacherDashboard Component Tests (`client/src/__tests__/TeacherDashboard.test.jsx`)
Tests teacher dashboard page.

**Key Test Cases:**
- ✅ Renders dashboard header
- ✅ Displays statistics cards with correct counts
- ✅ Shows action cards: Manage Courses, Upload Content, Analytics
- ✅ Navigation links to correct routes
- ✅ Fetches stats with authorization header
- ✅ Handles API errors gracefully
- ✅ Applies gradient styling to cards

**Run Command:**
```bash
cd client
npm test -- TeacherDashboard.test.jsx
```

## Running All Tests

### Backend Tests
```bash
cd server

# Run all unit tests
npm test

# Run all tests including integration
npm test -- --testPathPattern="tests"

# Run specific test file
npm test -- auth-security.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests
```bash
cd client

# Note: Frontend tests require Jest and @testing-library setup
# Current setup uses Vite + Vitest (if configured) or can be set up with Jest

# If using Vitest:
npm run test

# If using Jest (after setup):
npm test -- --coverage
```

## Test Coverage Goals

### Backend Coverage
- **Authentication & Authorization**: 95%+ coverage
  - User creation and email uniqueness
  - Token validation
  - Role-based access control
  - Course ownership verification

- **API Routes**: 90%+ coverage
  - All CRUD operations
  - Error handling
  - Input validation
  - Security checks

- **AI Integration**: 85%+ coverage
  - Content processing
  - Embedding generation
  - Chunk creation

### Frontend Coverage
- **Components**: 85%+ coverage
  - User interactions
  - API calls with auth headers
  - Error handling
  - State management

- **Pages**: 80%+ coverage
  - Page rendering
  - Navigation
  - Data loading

## Key Security Features Tested

✅ **Authentication**
- Bearer token validation on all protected endpoints
- Auto-user creation with unique email format
- Clerk integration verification

✅ **Authorization**
- Role-based access (TEACHER vs STUDENT)
- Course ownership verification
- Instructor-only endpoints protected

✅ **Course Security**
- Teachers can only edit/delete their own courses
- Teachers can only view their own courses
- Cross-teacher access prevented with 403 responses

✅ **AI Content Ingestion**
- Ownership verification before allowing indexing
- Teachers cannot index to courses they don't own
- Proper error messages for security violations

✅ **Video Upload**
- Course ownership verified before upload
- Teachers cannot upload to other courses
- Proper cleanup on video removal

## Updated Functionality Tested

### 1. Role-Based Redirect System
- `useUserRole` hook fetches and caches user role
- `RoleBasedRedirect` component intelligently routes users
- Navbar logo redirects based on user role
- Proper handling of signup vs login flows

### 2. Course Selector Dropdown
- Auto-fetches teacher's courses on ContentIngestion mount
- Displays course titles with publication status
- Pre-selects first course
- Shows loading/empty states appropriately

### 3. Authorization Headers
- VideoUpload includes Bearer token in upload and delete requests
- ContentIngestion includes token in course fetch and upload
- All teacher endpoints validate authorization

### 4. User Auto-Creation
- First API call creates user with unique email
- Unique format: `user_{clerkId}@astralearn.local`
- Prevents 404 errors on first endpoint access
- Subsequent calls use existing user record

### 5. Course Ownership Security
- GET /api/courses/instructor returns empty array (not 404) for new teachers
- AI ingestion routes verify course ownership
- Video upload routes verify course ownership
- Comprehensive 403 Forbidden responses with specific error messages

## Test Data & Mocking

### Mock User IDs
- Teacher: `u1` or `user_teacher_123`
- Another Teacher: `u2`
- Student: Various IDs with STUDENT role

### Mock Course IDs
- `c1`, `c2`, `c3` with various instructorIds

### Mock Clerk
- All Clerk middleware mocked to return test IDs
- Bearer tokens mocked as valid by default

### Mock Prisma
- All database calls mocked for isolation
- Realistic response shapes maintained
- Error scenarios testable

## Continuous Integration

### Recommended CI Configuration
```yaml
# Example: .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm install && npm test
      - run: cd client && npm install && npm run test (once Jest configured)
```

## Troubleshooting

### Backend Tests Fail with "Cannot find module"
- Ensure `jest.mock()` calls are at top of file
- Check NODE_PATH environment variable
- Run from project root: `npm test`

### Frontend Tests Fail with "Invalid hook call"
- Ensure components wrapped in necessary providers (Router, ClerkProvider)
- Mock Clerk and react-router-dom at module level
- Use `@testing-library/jest-dom` for extended matchers

### Authorization Header Not Being Sent
- Verify `useAuth().getToken()` is mocked to return a token
- Check axios mock is returning responses with correct status codes
- Ensure `cfg` or `headers` object is properly destructured in component

## Future Testing Enhancements

1. **E2E Tests**: Add Playwright or Cypress tests for full user flows
2. **Performance Tests**: Benchmark content ingestion with large files
3. **Load Tests**: Test multiple concurrent uploads
4. **Accessibility Tests**: Verify keyboard navigation and screen reader support
5. **Visual Regression**: Add screenshot comparison tests
6. **API Contract Tests**: Validate API changes don't break contracts

## Test Maintenance

- Update tests when adding new features
- Run tests before merging pull requests
- Maintain >80% code coverage
- Review test failures weekly
- Document any test-specific setup requirements
