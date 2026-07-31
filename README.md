# 🌟 Nexus - AI-Adaptive Learning Management System

A next-generation Learning Management System (LMS) that combines AI-powered personalized learning with a modern, intuitive interface. Built for students, instructors, and institutions who want to deliver a truly adaptive learning experience.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Key Features](#-key-features)
- [Architecture Overview](#-architecture-overview)
- [Challenges & Solutions](#-challenges--solutions)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🚀 Project Overview

Nexus is an AI-adaptive LMS that transforms how students learn and instructors teach. The platform uses **Google Gemini AI** to power an intelligent tutor that provides contextual, course-specific assistance. Students get personalized learning paths, while instructors gain powerful tools to create, manage, and analyze their courses.

The system is built for **scalability** and **real-time interactivity**, with a React frontend, Express.js backend, PostgreSQL database, and seamless integration with third-party services like Clerk (authentication), Mux (video streaming), and Stripe (payments).

**Who this is for:**
- **Students** — Learn at your own pace with AI-powered guidance
- **Instructors** — Create courses with rich media, quizzes, and analytics
- **Administrators** — Manage users, courses, and platform settings

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with functional components and hooks |
| **Vite** | Fast build tool and dev server with HMR |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Framer Motion** | Declarative animations and transitions |
| **React Router v6** | Client-side routing with loaders and actions |
| **React Hook Form + Zod** | Form validation with schema-based validation |
| **Axios** | HTTP client with interceptors for auth tokens |
| **Clerk React** | Authentication UI components and session management |
| **Stripe Elements** | Secure payment form components |
| **Mux Player React** | Video streaming with adaptive bitrate |
| **TipTap** | Rich text editor for course content |
| **React Hot Toast** | Toast notifications for user feedback |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Express.js 5** | Node.js web framework with middleware pipeline |
| **Prisma ORM** | Type-safe database client with migrations |
| **PostgreSQL** | Relational database for structured data |
| **Clerk Express** | Backend authentication middleware |
| **Google Gemini AI** | Multimodal AI for RAG-based tutoring |
| **Mux API** | Video upload, encoding, and streaming |
| **Stripe API** | Payment processing and webhooks |
| **Zod** | Schema validation for API inputs |
| **Multer** | File upload handling |
| **Nodemon** | Development auto-restart |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization for consistent environments |
| **Vercel** | Frontend deployment with serverless functions |
| **Render / Railway** | Backend hosting options |

---

## ✨ Key Features

### 🎓 For Students

| Feature | Description |
|---------|-------------|
| **AI-Powered Tutor** | Ask questions about course content and get instant, contextual answers powered by Google Gemini AI with RAG (Retrieval-Augmented Generation) |
| **Personalized Learning Paths** | Adaptive course recommendations based on progress, goals, and study habits |
| **Interactive Course Player** | Immersive learning experience with video, notes, bookmarks, and quizzes |
| **Progress Tracking** | Visual progress bars, streak tracking, achievement badges, and leaderboards |
| **Study Planner** | Set weekly goals, preferred study times, and focus areas |
| **Course Browser** | Discover courses with search, filtering by category/level, and detailed previews |
| **Discussion Boards** | Lesson-specific discussions with threaded replies |
| **Reviews & Ratings** | Rate and review courses to help the community |

### 👨‍🏫 For Instructors

| Feature | Description |
|---------|-------------|
| **Course Builder** | Intuitive drag-and-drop interface for structuring courses into sections and lessons |
| **Rich Content Editor** | TipTap-based WYSIWYG editor for lesson descriptions and content |
| **Video Integration** | Upload videos via Mux with automatic transcoding and streaming |
| **Content Ingestion** | Upload PDFs and text documents for AI-powered RAG setup |
| **Quiz Engine** | Create quizzes with multiple-choice and true/false questions, set passing scores and time limits |
| **Student Analytics** | Track enrollment, progress completion rates, and revenue |
| **AI-Powered Content** | Automatic content chunking and embedding for the AI tutor |

### 🔧 Platform Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Sign-up, sign-in, social login, and MFA via Clerk |
| **Role-Based Access** | Student / Instructor / Admin roles with route guards |
| **Real-Time Updates** | Instant progress tracking and notifications |
| **Payment Processing** | Course purchases via Stripe with secure webhooks |
| **Responsive Design** | Mobile-friendly layouts with adaptive navigation |
| **Error Handling** | Graceful error boundaries and fallback UIs |
| **Security** | Rate limiting, CORS, security headers, request ID tracking |

---

## 🏗️ Architecture Overview

```
                    ┌──────────────┐
                    │   Browser    │
                    │   (React)    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌──────────┐ ┌──────────┐
       │  Clerk    │ │ Express  │ │  Mux     │
       │  Auth     │ │ Backend  │ │  Video   │
       └───────────┘ └────┬─────┘ └──────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
       ┌───────────┐ ┌──────────┐ ┌──────────┐
       │PostgreSQL │ │ Gemini   │ │  Stripe  │
       │(Prisma)   │ │ AI       │ │ Payments │
       └───────────┘ └──────────┘ └──────────┘
```

**How it works:**
1. User signs in via Clerk React SDK → gets a session token
2. React app makes API calls with the token in headers
3. Express middleware validates the token, then routes to the handler
4. Route handlers use services (Prisma for DB, Gemini for AI, Mux for video, Stripe for payments)
5. Response flows back through the middleware to the React UI

---

## 🧠 Challenges & Solutions

### 1. AI-Powered RAG (Retrieval-Augmented Generation)

**Challenge:** The AI tutor needed to answer questions based on specific course content, not just general knowledge. This required storing and retrieving course content efficiently.

**Solution:** We built a content ingestion pipeline that:
- Accepts PDFs and text documents via upload
- Chunks content into manageable pieces with metadata
- Stores chunks in the `CourseContent` table
- On query, retrieves relevant chunks based on the course context
- Passes chunks to Gemini AI as context for generating answers
- Returns answers with source references

### 2. Video Streaming at Scale

**Challenge:** Self-hosting video would be complex and expensive. We needed a solution that handles encoding, adaptive bitrate streaming, and global CDN delivery.

**Solution:** Integrated **Mux** for video handling:
- Uploads go directly to Mux via a signed URL
- Mux handles transcoding, thumbnails, and adaptive streaming
- The frontend uses Mux's React player component for optimal playback
- Backend stores only the Mux asset/playback IDs, not the video files

### 3. Authentication & Authorization

**Challenge:** We needed a flexible auth system that supports SSO, social login, MFA, and role-based access control without building from scratch.

**Solution:** **Clerk** handles the authentication layer:
- Frontend uses Clerk's React SDK for sign-up/sign-in flows
- Backend uses Clerk's Express middleware to verify session tokens
- User roles (Student/Instructor/Admin) are stored in our database
- Middleware guards (`requireAuth()`, `TeacherGuard`, `AdminPage`) enforce access

### 4. Quiz Engine with Scoring

**Challenge:** The quiz system needed to support multiple question types, time limits, passing scores, and store detailed attempt data.

**Solution:** We designed a flexible quiz schema:
- Questions can be multiple-choice or true/false
- Each question has a point value for weighted scoring
- Attempts store all answers as JSON and calculate percentage scores
- Passing/failing is determined by the quiz's passing score threshold
- Results are stored per-user per-quiz for historical tracking

### 5. Real-Time Progress Tracking

**Challenge:** Students need immediate feedback when they complete lessons, and the UI should reflect progress without manual refresh.

**Solution:** 
- Lesson completion triggers an API call to `/api/progress`
- The backend upserts progress records (unique per user+lesson)
- Course-level progress is calculated from aggregate lesson completions
- The frontend refetches progress data on navigation and after actions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **PostgreSQL** v14 or higher (or Docker)
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd astralearn
```

### 2. Environment Setup

#### Backend Environment (`.env` in root directory)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_lms"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Mux (Video Streaming)
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# Stripe (Payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment (`client/.env`)

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_URL=http://localhost:5000
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Database Setup

Set up PostgreSQL (via Docker or local install):

```bash
# Option A: Using Docker
docker run --name nexus-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=nexus_lms -p 5432:5432 -d postgres:14

# Option B: Local PostgreSQL
# Ensure PostgreSQL is running and create the database:
createdb nexus_lms
```

Then run Prisma migrations and seed data:

```bash
cd server
npx prisma generate
npx prisma db push
# Optional: seed with sample data
npx prisma db seed
```

### 5. Run the Application

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 6. Verify It Works

```bash
# Test the API health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","message":"Server is running"}
```

---

## 📁 Project Structure

```
astralearn/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   └── ui/                  # Primitive UI components (Button, Card, etc.)
│   │   ├── pages/                   # Route-level page components
│   │   │   └── teacher/             # Instructor-specific pages
│   │   ├── layouts/                 # Page layout wrappers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility functions and API client
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── package.json                 # Frontend dependencies and scripts
│
├── server/                          # Backend Express application
│   ├── src/
│   │   ├── routes/                  # API route handlers
│   │   ├── middleware/              # Express middleware
│   │   ├── lib/                     # Services and utilities
│   │   ├── app.js                   # Express app setup
│   │   └── index.js                 # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.js                  # Sample data seeder
│   ├── scripts/                     # Utility scripts
│   └── package.json                 # Backend dependencies and scripts
│
├── api/                             # Vercel serverless functions
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment variable template
├── docker-compose.yml               # Docker Compose configuration
├── package.json                     # Root workspace config
├── vercel.json                      # Vercel deployment config
└── README.md                        # This file
```

---

## 💻 Development Workflow

### Available Scripts

**Backend** (`server/`):

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon src/index.js` | Start dev server with auto-reload |
| `npm start` | `node src/index.js` | Start production server |
| `npm run prisma:generate` | `prisma generate` | Generate Prisma client |
| `npm run prisma:push` | `prisma db push` | Push schema to database |
| `npm run prisma:studio` | `prisma studio` | Open Prisma Studio GUI |

**Frontend** (`client/`):

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start dev server with HMR |
| `npm run build` | `vite build` | Production build |
| `npm run preview` | `vite preview` | Preview production build |

### Code Style Guidelines

- **ES6+ syntax** — Use modern JavaScript features
- **Functional components** — React components as functions with hooks
- **Error handling** — Wrap async operations in try/catch, show user-friendly errors
- **Loading states** — Show loading indicators during async operations
- **Validation** — Validate all API inputs with Zod schemas
- **Environment variables** — Never commit secrets; use `.env` files

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of your change"

# Push and create a PR
git push origin feature/your-feature-name
```

Use conventional commit messages:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
# Connect your repo to Vercel and deploy
# Set environment variables in Vercel dashboard
```

### Backend (Render / Railway / AWS)

```bash
cd server
# Set environment variables in your hosting platform
# Deploy using platform CLI or git integration
```

### Docker (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🔐 External Services Setup

To run the full application, you'll need accounts with these services:

| Service | Purpose | Setup Guide |
|---------|---------|-------------|
| **Clerk** | Authentication | [clerk.com](https://clerk.com) — Create app, get API keys |
| **Google Gemini** | AI Tutor | [ai.google.dev](https://ai.google.dev) — Generate API key |
| **Mux** | Video Streaming | [mux.com](https://mux.com) — Generate access tokens |
| **Stripe** | Payments | [stripe.com](https://stripe.com) — Get API keys |

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Clerk** for authentication infrastructure
- **Mux** for video streaming and encoding
- **Google** for Gemini AI
- **Tailwind Labs** for Tailwind CSS
- **Vercel** for hosting and Vite

---

## 📞 Support

For support, email support@nexuslms.com or join our Discord community.

---

Built with ❤️ by the Nexus Team