# ✅ Pre-Launch Checklist for Nexus LMS

Use this checklist to ensure everything is set up correctly before launching your LMS!

---

## 📋 Environment Setup

### Backend (.env in root)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- [ ] `CLERK_SECRET_KEY` - From Clerk dashboard
- [ ] `GEMINI_API_KEY` - From Google AI Studio
- [ ] `PORT` - Set to 3000 (or your preference)
- [ ] `NODE_ENV` - Set to development or production

### Frontend (client/.env)
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` - Same as backend publishable key
- [ ] `VITE_API_URL` - Backend URL (http://localhost:3000 for dev)

### Optional (Enhanced Features)
- [ ] `MUX_TOKEN_ID` - For video hosting
- [ ] `MUX_TOKEN_SECRET` - For video hosting
- [ ] `STRIPE_SECRET_KEY` - For payments
- [ ] `STRIPE_WEBHOOK_SECRET` - For payment webhooks

---

## 💾 Database Setup

- [ ] PostgreSQL is installed and running
- [ ] Database "nexus_lms" is created
- [ ] Prisma schema is generated: \`npx prisma generate\`
- [ ] Database is synced: \`npx prisma db push\`
- [ ] (Optional) Seed data loaded: \`npx prisma db seed\`

---

## 📦 Dependencies Installed

### Backend
- [ ] \`cd server && npm install\` completed successfully
- [ ] No dependency errors
- [ ] Prisma client generated

### Frontend
- [ ] \`cd client && npm install\` completed successfully
- [ ] No dependency errors
- [ ] Tailwind CSS configured

---

## 🔐 Authentication (Clerk)

- [ ] Clerk account created
- [ ] Application created in Clerk dashboard
- [ ] Publishable key copied
- [ ] Secret key copied
- [ ] Redirect URLs configured:
  - [ ] http://localhost:5173 (development)
  - [ ] Your production domain (when deploying)
- [ ] Social providers enabled (optional):
  - [ ] Google
  - [ ] GitHub
  - [ ] Others

---

## 🤖 AI Setup (Gemini)

- [ ] Google AI account created
- [ ] API key generated from https://ai.google.dev
- [ ] API key added to backend .env
- [ ] API key tested (backend should start without errors)

---

## 🎥 Video Setup (Optional - Mux)

- [ ] Mux account created
- [ ] Access tokens generated
- [ ] Tokens added to .env
- [ ] Test video uploaded

---

## 💳 Payment Setup (Optional - Stripe)

- [ ] Stripe account created
- [ ] API keys obtained
- [ ] Webhook endpoint configured
- [ ] Test mode enabled for development

---

## 🚀 Running the Application

### Backend Server
- [ ] \`cd server && npm run dev\` runs without errors
- [ ] Server starts on http://localhost:3000
- [ ] Console shows: "🚀 Server running on http://localhost:3000"
- [ ] Health check works: http://localhost:3000/api/health

### Frontend Application
- [ ] \`cd client && npm run dev\` runs without errors
- [ ] Vite server starts on http://localhost:5173
- [ ] Browser opens automatically
- [ ] No console errors

---

## 🧪 Testing Features

### Landing Page
- [ ] Page loads correctly
- [ ] Animations work smoothly
- [ ] "Get Started" button navigates to sign-up
- [ ] "Sign In" button works
- [ ] Responsive on mobile

### Authentication
- [ ] Sign up form appears
- [ ] Can create new account
- [ ] Email verification works (if enabled)
- [ ] Sign in works
- [ ] Redirects to dashboard after login

### Student Dashboard
- [ ] Dashboard loads
- [ ] Welcome message shows correct name
- [ ] Statistics cards display (even if zeros)
- [ ] "Browse Courses" link works
- [ ] Profile link works

### Course Browser
- [ ] Courses load (or shows empty state)
- [ ] Search works
- [ ] Filters work (category, level)
- [ ] Course cards are clickable
- [ ] Navigation works

### Course Detail
- [ ] Course details load
- [ ] Enroll button appears
- [ ] Enrollment works
- [ ] "Continue Learning" appears after enrollment

### Course Player
- [ ] Player loads in cinema mode
- [ ] Curriculum sidebar shows
- [ ] Can navigate between lessons
- [ ] Mark complete works
- [ ] AI Tutor button appears
- [ ] AI Tutor panel slides in
- [ ] Can send messages to AI
- [ ] AI responds (if Gemini key is set up)

### Instructor Features
- [ ] Can access /instructor dashboard
- [ ] Create course works
- [ ] Course appears in list
- [ ] Edit course works
- [ ] Can save changes
- [ ] Published toggle works

### Profile
- [ ] Profile page loads
- [ ] Shows correct user info
- [ ] Avatar displays initials

---

## 🎨 Visual Checks

- [ ] Colors match the brand (blue/purple gradients)
- [ ] Fonts load correctly (Inter)
- [ ] Icons display (Lucide React)
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Images load or show placeholders
- [ ] Hover effects work
- [ ] Dark mode works (course player)

---

## 📱 Responsive Design

- [ ] Mobile (375px width) - All pages work
- [ ] Tablet (768px width) - All pages work
- [ ] Desktop (1440px width) - All pages work
- [ ] Mobile menu works
- [ ] Touch targets are large enough

---

## 🔍 Browser Testing

- [ ] Chrome - Works perfectly
- [ ] Firefox - Works perfectly
- [ ] Safari - Works perfectly
- [ ] Edge - Works perfectly
- [ ] Mobile browsers - Tested

---

## ⚡ Performance

- [ ] Pages load quickly (< 3 seconds)
- [ ] No console errors
- [ ] No console warnings
- [ ] Images are optimized
- [ ] API calls are fast
- [ ] Smooth scrolling

---

## 🔒 Security

- [ ] Environment variables are in .env (not committed)
- [ ] .gitignore includes .env
- [ ] API keys are secure
- [ ] CORS is configured correctly
- [ ] Authentication works on all protected routes
- [ ] Can't access instructor pages as student

---

## 📊 Database

- [ ] Can create courses
- [ ] Can enroll in courses
- [ ] Progress tracking works
- [ ] User data persists
- [ ] No duplicate enrollments allowed

---

## 🐛 Error Handling

- [ ] 404 page shows for invalid routes
- [ ] API errors show toast notifications
- [ ] Loading states show during API calls
- [ ] Form validation works
- [ ] Helpful error messages

---

## 📝 Documentation

- [ ] README.md is clear
- [ ] SETUP.md has all steps
- [ ] .env.example is provided
- [ ] Code has comments where needed

---

## 🚢 Pre-Deployment

- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] SEO meta tags added
- [ ] Favicon set
- [ ] Social media preview images
- [ ] Analytics code ready (if using)

---

## 🎯 Production Checklist (When Deploying)

### Frontend (Vercel/Netlify)
- [ ] Build succeeds: \`npm run build\`
- [ ] Preview deployment works
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active

### Backend (Render/Railway/AWS)
- [ ] Deployment succeeds
- [ ] Database connected
- [ ] Environment variables set
- [ ] Health check passes
- [ ] CORS includes production domain

### Database
- [ ] Production database created
- [ ] Migrations run
- [ ] Backups configured
- [ ] Connection pooling set up

---

## ✅ Final Checks

- [ ] All features work end-to-end
- [ ] No broken links
- [ ] All images load
- [ ] Forms submit successfully
- [ ] User can complete full journey:
  1. Land on homepage
  2. Sign up
  3. Browse courses
  4. Enroll in course
  5. Watch lessons
  6. Use AI tutor
  7. Track progress

---

## 🎊 Ready to Launch!

If all items are checked ✅, you're ready to launch your amazing LMS platform!

**Congratulations! 🚀**

---

## 📞 Need Help?

If you're stuck on any item:
1. Check the error messages
2. Review the SETUP.md guide
3. Check documentation (README.md, FEATURES.md)
4. Review your .env files
5. Ensure all services are running
6. Check browser console for errors

---

**Last Updated:** November 27, 2025
**Version:** 1.0.0
