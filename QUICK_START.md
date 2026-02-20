# 🚀 Quick Start Guide - AstraLearn

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Clerk account set up
- Stripe account (for payments)
- Mux account (for video hosting)
- Google Gemini API key (for AI features)

---

## Step 1: Clone & Install

```bash
cd D:\Projects\astralearn

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## Step 2: Environment Setup

### Backend (.env in root directory)

Create `D:\Projects\astralearn\.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nexus_lms"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Stripe Payment
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Mux Video
MUX_TOKEN_ID="your_mux_token_id"
MUX_TOKEN_SECRET="your_mux_token_secret"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env in client directory)

Create `D:\Projects\astralearn\client\.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

---

## Step 3: Database Setup

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

---

## Step 4: Start Development Servers

### Terminal 1 - Backend
```bash
cd server
npm run dev
```
✅ Server will start on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
✅ Client will start on http://localhost:5173

---

## Step 5: Create Your First Account

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create an account (will be a STUDENT by default)

### To Create a Teacher Account:

**Option 1: Direct Database Update**
```sql
UPDATE "User" SET role = 'TEACHER' WHERE email = 'your@email.com';
```

**Option 2: Use Prisma Studio**
```bash
cd server
npx prisma studio
```
Then navigate to the User table and change the role to "TEACHER"

---

## Step 6: Test the Features

### As Student:
1. ✅ Browse courses
2. ✅ Enroll in a course (free or paid)
3. ✅ Watch lessons
4. ✅ Mark lessons as complete
5. ✅ Take quizzes
6. ✅ Use AI chatbot

### As Teacher:
1. ✅ Create a course
2. ✅ Add sections and lessons
3. ✅ Upload videos
4. ✅ Create quizzes
5. ✅ Ingest content for AI
6. ✅ View analytics

---

## Common Commands

### Backend
```bash
# Start development server
npm run dev

# View database in browser
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma Client
npx prisma generate
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### "Database doesn't exist"
```bash
# Create database manually
createdb nexus_lms

# Or use PostgreSQL client
psql -U postgres
CREATE DATABASE nexus_lms;
```

### "Port already in use"
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### "Clerk authentication failed"
1. Check CLERK_SECRET_KEY in backend .env
2. Check VITE_CLERK_PUBLISHABLE_KEY in client .env
3. Ensure keys are from the same Clerk application

### "Can't connect to database"
1. Ensure PostgreSQL is running
2. Check DATABASE_URL connection string
3. Verify database exists
4. Check PostgreSQL logs

### "Prisma Client not generated"
```bash
cd server
npx prisma generate
```

---

## Default Test Accounts

After running the application, you can create test accounts:

**Student Account:**
- Create via signup page
- Default role: STUDENT

**Teacher Account:**
- Create via signup page
- Update role in database to TEACHER
- OR use SQL:
```sql
UPDATE "User" SET role = 'TEACHER' WHERE email = 'teacher@test.com';
```

---

## API Endpoints

Server runs on: `http://localhost:5000`

Key endpoints:
- `GET /api/courses` - List all courses
- `GET /api/courses/my-courses` - My enrolled courses
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/progress/lesson/:id` - Mark lesson complete
- `POST /api/quizzes/:id/attempt` - Submit quiz

See `API_REFERENCE.md` for complete documentation.

---

## Project Structure

```
astralearn/
├── server/                 # Backend (Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   └── lib/           # Utilities
│   └── package.json
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── App.jsx
│   └── package.json
│
└── .env                    # Environment variables
```

---

## Development Workflow

1. **Make Backend Changes:**
   - Edit files in `server/src/`
   - Server auto-restarts with nodemon

2. **Make Frontend Changes:**
   - Edit files in `client/src/`
   - Browser auto-refreshes with HMR

3. **Update Database Schema:**
   ```bash
   # Edit server/prisma/schema.prisma
   cd server
   npx prisma db push
   npx prisma generate
   ```

4. **Test Changes:**
   - Use browser dev tools
   - Check server logs
   - Use Prisma Studio for database

---

## Production Deployment

See `DEPLOYMENT.md` for production deployment guide (coming soon).

---

## Need Help?

1. Check documentation:
   - `COMPLETE_FIX_SUMMARY.md` - What was fixed
   - `API_REFERENCE.md` - API documentation
   - `FRONTEND_UPDATES.md` - Frontend changes
   - `FIXES_APPLIED.md` - Backend changes

2. Check logs:
   - Backend: Terminal running server
   - Frontend: Browser console
   - Database: Prisma Studio

3. Common issues documented in `TROUBLESHOOTING.md` (coming soon)

---

## 🎉 You're Ready!

Your AstraLearn application is now fully set up and ready for development!

Happy coding! 🚀
