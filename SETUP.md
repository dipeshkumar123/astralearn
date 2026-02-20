# 🚀 Quick Setup Guide for Nexus LMS

## Step-by-Step Setup Instructions

### 1. Prerequisites Check
Make sure you have installed:
- ✅ Node.js (v18+): `node --version`
- ✅ PostgreSQL (v14+): `psql --version`
- ✅ Git: `git --version`

### 2. Database Setup

#### Create PostgreSQL Database
\`\`\`powershell
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE nexus_lms;

# Exit PostgreSQL
\q
\`\`\`

### 3. Environment Variables

#### Backend (.env in root directory)
Create a `.env` file in the root directory and copy from `.env.backup` or add:

\`\`\`env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexus_lms"
CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_key_here
GEMINI_API_KEY=your_key_here
PORT=3000
\`\`\`

#### Frontend (client/.env)
Create a `.env` file in the client directory:

\`\`\`env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3000
\`\`\`

### 4. Get API Keys

#### Clerk (Authentication) - Required
1. Go to https://clerk.com
2. Sign up and create a new application
3. Copy **Publishable Key** and **Secret Key**
4. Add to both backend and frontend .env files

#### Google Gemini AI - Required for AI Tutor
1. Go to https://ai.google.dev
2. Get your API key
3. Add to backend .env as `GEMINI_API_KEY`

#### Mux (Video Hosting) - Optional
1. Go to https://mux.com
2. Create account and get API tokens
3. Add to backend .env

### 5. Install Dependencies

\`\`\`powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
\`\`\`

### 6. Setup Database Schema

\`\`\`powershell
cd server
npx prisma generate
npx prisma db push
\`\`\`

### 7. Run the Application

Open two PowerShell terminals:

**Terminal 1 - Backend:**
\`\`\`powershell
cd server
npm run dev
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`powershell
cd client
npm run dev
\`\`\`

### 8. Access the Application

- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:3000

### 9. First Steps

1. Click **"Get Started"** or **"Sign Up"** on the landing page
2. Create an account using Clerk
3. You'll be redirected to your dashboard
4. Browse courses or create your first course as an instructor

## 🎨 Features to Explore

### As a Student:
- ✅ Browse courses with advanced filters
- ✅ Enroll in courses (free or paid)
- ✅ Watch video lessons with AI tutor support
- ✅ Track your progress with visual analytics
- ✅ Mark lessons as complete
- ✅ Access your profile and settings

### As an Instructor:
- ✅ Create and manage courses
- ✅ Upload video content via Mux
- ✅ Build course curriculum with sections and lessons
- ✅ Track student enrollment and progress
- ✅ Publish or unpublish courses
- ✅ Set course pricing

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: \`psql -U postgres -l\`

### Issue: "Clerk authentication failed"
**Solution:**
- Verify API keys are correct in .env files
- Check that both VITE_CLERK_PUBLISHABLE_KEY (frontend) and CLERK_SECRET_KEY (backend) are set
- Make sure you're using the same Clerk application for both

### Issue: "Port already in use"
**Solution:**
\`\`\`powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
\`\`\`

### Issue: "Module not found"
**Solution:**
\`\`\`powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
\`\`\`

## 📱 Testing the Features

### Test AI Tutor:
1. Enroll in a course
2. Open the course player
3. Click "AI Tutor" button
4. Ask questions about the lesson

### Test Course Creation:
1. Go to Instructor Dashboard
2. Click "Create Course"
3. Fill in course details
4. Add sections and lessons
5. Publish the course

## 🎉 You're All Set!

Enjoy building and learning with Nexus LMS!

For more information, check the main README.md file.

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the code comments for implementation details
- Check browser console for frontend errors
- Check server terminal for backend errors
