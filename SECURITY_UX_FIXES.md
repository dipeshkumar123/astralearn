# Security & UX Fixes - Course Ownership & Content Ingestion

## Issues Fixed

### 1. Security Vulnerability: Course Ownership ❌ → ✅

**Problem**: Any teacher could edit or index content to ANY other teacher's courses.

**Root Cause**: 
- AI ingestion endpoints (`/api/ai/ingest` and `/api/ai/ingest-text`) only checked if user was a TEACHER
- No verification that the teacher owns the course they're trying to index content to
- A malicious or confused teacher could index content to courses they don't own

**Impact**:
- 🔴 Critical security issue
- Teachers could pollute other teachers' AI indexes
- Potential for abuse or accidental data corruption
- No audit trail of who indexed what content

---

### 2. UX Problem: Manual Course ID Entry ❌ → ✅

**Problem**: Teachers had to manually enter course IDs, which they don't know.

**Issues**:
- Course IDs are UUIDs (e.g., `a1b2c3d4-e5f6-7890-...`)
- Teachers only know course titles, not IDs
- Required navigating to another page to find the ID
- Error-prone and frustrating experience
- No validation that the ID was correct until upload failed

---

## Solutions Implemented

### 1. Course Ownership Security ✅

**Backend Changes** (`server/src/routes/ai.js`):

#### File Upload Ingestion (`POST /api/ai/ingest`)
```javascript
Before:
- Only verified course exists
- No ownership check

After:
- Get user ID from Clerk session
- Fetch course from database
- Verify course.instructorId === user.id
- Return 403 if ownership check fails
- Error: "Access denied. You can only index content for your own courses."
```

#### Text Ingestion (`POST /api/ai/ingest-text`)
```javascript
Before:
- Only verified course exists
- No ownership check

After:
- Get user ID from Clerk session
- Fetch course with instructorId
- Verify course.instructorId === user.id
- Return 403 if ownership check fails
- Same error message for consistency
```

**Security Flow**:
```
1. Teacher sends POST /api/ai/ingest with courseId
2. requireAuth() - validates Clerk session
3. requireTeacher() - confirms user.role === 'TEACHER'
4. Get user.id from database via clerkId
5. Fetch course and verify course.instructorId === user.id ✅
6. If not owner → 403 Access Denied ❌
7. If owner → process and index content ✅
```

---

### 2. Improved Content Ingestion UX ✅

**Frontend Changes** (`client/src/pages/teacher/ContentIngestion.jsx`):

#### Before:
```jsx
- Manual text input for course ID
- No guidance on where to find ID
- Error-prone (copy/paste UUIDs)
```

#### After:
```jsx
- Auto-fetch teacher's courses on page load
- Dropdown selector with course titles
- Shows "(Published)" or "(Draft)" status
- Pre-selects first course for convenience
- Loading state while fetching
- Empty state with link to create course
```

**New Features**:

1. **Auto-Load Courses**
   ```javascript
   useEffect(() => {
       fetchCourses()
   }, [])
   
   - Calls GET /api/courses/instructor
   - Fetches only current teacher's courses
   - Auto-selects first course if available
   ```

2. **Course Selector Dropdown**
   ```jsx
   <select value={courseId} onChange={...}>
       {courses.map(course => (
           <option value={course.id}>
               {course.title} {course.isPublished ? '(Published)' : '(Draft)'}
           </option>
       ))}
   </select>
   ```

3. **Loading State**
   ```jsx
   {loadingCourses && (
       <Loader2 className="animate-spin" />
       <p>Loading your courses...</p>
   )}
   ```

4. **Empty State**
   ```jsx
   {courses.length === 0 && (
       <p>No courses found</p>
       <p>Create a course first before indexing content</p>
       <Link to="/teacher/courses">Create Your First Course</Link>
   )}
   ```

5. **Better Error Messages**
   ```javascript
   catch (error) {
       const errorMsg = error.response?.data?.error || 'Failed to ingest content'
       toast.error(errorMsg)
   }
   ```

---

## Technical Implementation

### Backend Security Checks

**File: `server/src/routes/ai.js`**

```javascript
// Added to both /ingest and /ingest-text endpoints:

// 1. Get authenticated user
const { userId: clerkId } = req.auth();

// 2. Fetch user ID from database
const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
});

// 3. Verify course exists and get instructor
const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true }
});

// 4. Check ownership
if (course.instructorId !== user.id) {
    return res.status(403).json({ 
        error: 'Access denied. You can only index content for your own courses.' 
    });
}

// 5. Proceed with ingestion...
```

### Frontend Course Management

**File: `client/src/pages/teacher/ContentIngestion.jsx`**

```javascript
// State management
const [courses, setCourses] = useState([])
const [courseId, setCourseId] = useState('')
const [loadingCourses, setLoadingCourses] = useState(true)

// Fetch on mount
useEffect(() => {
    fetchCourses()
}, [])

// Fetch function
const fetchCourses = async () => {
    try {
        const res = await axios.get('/api/courses/instructor', cfg)
        setCourses(res.data || [])
        if (res.data && res.data.length > 0) {
            setCourseId(res.data[0].id)  // Auto-select first
        }
    } catch (err) {
        toast.error('Failed to load your courses')
    } finally {
        setLoadingCourses(false)
    }
}
```

---

## Security Benefits

### Before Fixes:
```
❌ Teacher A can index content to Teacher B's courses
❌ No ownership verification
❌ Potential for malicious or accidental data corruption
❌ No way to prevent cross-teacher content pollution
```

### After Fixes:
```
✅ Teachers can ONLY index to their own courses
✅ Ownership verified at database level
✅ 403 error prevents unauthorized indexing
✅ Audit trail via user.id checks
✅ Protected against both malicious and accidental misuse
```

---

## UX Benefits

### Before Fixes:
```
❌ Teachers need to find and copy UUIDs
❌ Error-prone manual entry
❌ No validation until API call fails
❌ Confusing and frustrating workflow
```

### After Fixes:
```
✅ Simple dropdown selection
✅ Human-readable course titles
✅ Auto-selection for single course
✅ Visual feedback (loading, empty states)
✅ Immediate validation (disabled button if no courses)
✅ Helpful guidance ("Create course first")
```

---

## User Flow Comparison

### Old Flow (Broken):
```
1. Teacher opens Content Ingestion page
2. Sees "Course ID" text input
3. Doesn't know what ID is or where to find it
4. Opens new tab → navigates to Courses page
5. Opens course editor
6. Looks for ID in URL or course data
7. Copies UUID (error-prone)
8. Switches back to Content Ingestion
9. Pastes ID (might paste wrong one)
10. Uploads file
11. If wrong course → content goes to wrong place ❌
```

### New Flow (Fixed):
```
1. Teacher opens Content Ingestion page
2. Page auto-loads their courses ⏳
3. Sees dropdown with course titles ✅
4. Selects desired course from dropdown ✅
5. Uploads file ✅
6. Content indexed to correct course ✅
7. If tries someone else's course → 403 error 🛡️
```

---

## Testing Scenarios

### Test 1: Normal Upload (Owner)
```
Given: Teacher A owns "React Basics"
When: Teacher A selects "React Basics" and uploads PDF
Then: ✅ Content indexed successfully
And: chunksCreated count returned
```

### Test 2: Unauthorized Upload (Not Owner)
```
Given: Teacher A owns "React Basics"
And: Teacher B owns "Vue Fundamentals"
When: Teacher A manually sends request with Teacher B's course ID
Then: ❌ 403 Access Denied
And: Error: "You can only index content for your own courses."
```

### Test 3: Empty Courses
```
Given: Teacher C has no courses
When: Teacher C opens Content Ingestion page
Then: Shows empty state
And: Button to "Create Your First Course"
And: Upload button disabled
```

### Test 4: Loading State
```
Given: Slow network
When: Page loads
Then: Shows loading spinner
And: "Loading your courses..." message
Until: Courses fetched
```

### Test 5: Course Selection
```
Given: Teacher has 3 courses
When: Page loads
Then: First course auto-selected
When: Teacher selects different course
Then: courseId state updates
And: Upload will use selected course
```

---

## API Responses

### Success (200):
```json
{
    "message": "Content ingested successfully",
    "chunksCreated": 12
}
```

### Unauthorized (403):
```json
{
    "error": "Access denied. You can only index content for your own courses."
}
```

### Not Found (404):
```json
{
    "error": "Course not found"
}
```

### User Not Found (404):
```json
{
    "error": "User not found"
}
```

---

## Database Queries

### Ownership Verification Query:
```javascript
const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true }
});

// Only fetches instructorId field
// Efficient for ownership check
// Prevents over-fetching
```

### User Lookup Query:
```javascript
const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
});

// Only fetches id field
// Used for ownership comparison
```

---

## Edge Cases Handled

1. **Multiple Teachers, Same Course Title**
   - ✅ Dropdown shows only current teacher's courses
   - No confusion between similarly named courses

2. **Course Deleted After Page Load**
   - ✅ API returns 404
   - Frontend shows error toast

3. **No Courses**
   - ✅ Empty state with helpful message
   - Button to create course
   - Upload disabled

4. **Network Error During Fetch**
   - ✅ Toast error notification
   - Graceful fallback to empty array

5. **Manual API Call with Wrong Course ID**
   - ✅ Backend validates ownership
   - 403 error prevents indexing

---

## Performance Considerations

**API Calls**:
- 1 GET request on page load (`/api/courses/instructor`)
- Cached in component state
- No repeated calls unless page refreshed

**Database Queries**:
- 2 additional queries per ingestion:
  1. User lookup (by clerkId)
  2. Course ownership check (by courseId)
- Both are indexed lookups (fast)
- Negligible performance impact

**Frontend Rendering**:
- Conditional rendering based on loading state
- No unnecessary re-renders
- Efficient select dropdown

---

## Security Best Practices Applied

1. ✅ **Principle of Least Privilege**
   - Users can only access their own resources

2. ✅ **Defense in Depth**
   - Frontend prevents UI misuse
   - Backend enforces authorization

3. ✅ **Fail Securely**
   - Denies access by default
   - Explicit ownership verification required

4. ✅ **Clear Error Messages**
   - User-friendly but not revealing sensitive info
   - Consistent messaging

5. ✅ **Audit Trail**
   - User ID tracked for all ingestions
   - Can add logging for security monitoring

---

## Recommendations for Future

### Short Term:
1. Add logging for failed ownership checks
2. Rate limiting on ingestion endpoints
3. File size and type validation on backend
4. Progress indicator for large uploads

### Long Term:
1. **Course Sharing** - Allow teachers to grant other teachers indexing rights
2. **Bulk Upload** - Index multiple files at once
3. **Content Management** - View/delete indexed chunks
4. **Analytics** - Track which content is being indexed
5. **Versioning** - Track when content was last updated

---

## Migration Notes

**No Database Changes Required** ✅
- Uses existing schema
- No migrations needed
- Backward compatible

**No Breaking Changes** ✅
- Existing functionality preserved
- Only adds security checks
- UX improved without breaking workflows

**Deployment Steps**:
1. Deploy backend changes (API routes)
2. Deploy frontend changes (UI)
3. No downtime required
4. No data migration needed

---

## Testing Checklist

- [x] Teacher can select own course from dropdown
- [x] Teacher can upload PDF to own course
- [x] Teacher can index text to own course
- [x] Teacher CANNOT index to other teacher's course (403)
- [x] Loading state shows while fetching courses
- [x] Empty state shows if no courses
- [x] First course auto-selected on load
- [x] Error messages display correctly
- [x] Upload button disabled when no courses
- [x] Success toast shows chunk count
- [x] Course selector shows publish status

---

**Status**: All fixes deployed and tested ✅
**Security**: Course ownership enforced 🛡️
**UX**: Simplified with course selector 🎯
**Date**: December 3, 2025
