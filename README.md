# 🌟 Nexus - AI-Adaptive Learning Management System

A next-generation Learning Management System with AI-powered personalized learning, built with React, Express.js, and Google Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

## ✨ Features

### 🎓 For Students
- **AI-Powered Tutor**: Get instant help from an intelligent AI assistant that understands your course content
- **Personalized Learning Paths**: Adaptive learning journeys that adjust to your progress
- **Interactive Course Player**: Beautiful, distraction-free learning experience
- **Progress Tracking**: Visual skill maps and detailed analytics
- **Course Browser**: Discover thousands of courses across multiple categories
- **Mobile-Friendly**: Learn anywhere, anytime on any device

### 👨‍🏫 For Instructors
- **Course Creation**: Intuitive course builder with drag-and-drop sections
- **Video Integration**: Seamless Mux integration for video hosting
- **Student Analytics**: Real-time insights into student performance
- **AI-Powered Content**: Automatic content ingestion and RAG setup
- **Quiz Engine**: Create assessments with instant feedback

### 🚀 Platform Features
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Authentication**: Secure auth with Clerk (SSO, social login, MFA)
- **Real-time Updates**: Live progress tracking and notifications
- **Scalable Architecture**: Built for growth with PostgreSQL and Redis
- **Payment Integration**: Stripe for course purchases

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Clerk** - Authentication and user management
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Hook Form** - Form validation
- **React Hot Toast** - Beautiful notifications

### Backend
- **Express.js** - Node.js web framework
- **PostgreSQL** - Relational database with Prisma ORM
- **Gemini AI** - Google's multimodal AI for RAG
- **Mux** - Video streaming and encoding
- **Clerk** - Backend auth middleware
- **Stripe** - Payment processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd astralearn
\`\`\`

### 2. Environment Setup

#### Backend (.env in root directory)

\`\`\`env
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
PORT=3000
NODE_ENV=development
\`\`\`

#### Frontend (client/.env)

\`\`\`env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_URL=http://localhost:3000
\`\`\`

### 3. Install Dependencies

#### Backend
\`\`\`bash
cd server
npm install
\`\`\`

#### Frontend
\`\`\`bash
cd client
npm install
\`\`\`

### 4. Database Setup

\`\`\`bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed with sample data
\`\`\`

### 5. Run the Application

#### Start Backend (Terminal 1)
\`\`\`bash
cd server
npm run dev
\`\`\`

#### Start Frontend (Terminal 2)
\`\`\`bash
cd client
npm run dev
\`\`\`

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📁 Project Structure

\`\`\`
astralearn/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── layout/       # Layout components (Navbar, etc.)
│   │   ├── pages/            # Page components
│   │   │   ├── instructor/   # Instructor dashboard pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CourseBrowser.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── CoursePlayer.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                    # Backend Express application
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── lib/              # Utilities (Prisma, Gemini, etc.)
│   │   ├── middleware/       # Custom middleware
│   │   └── index.js          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Seed data
│   └── package.json
│
├── .env                       # Backend environment variables
└── README.md
\`\`\`

## 🎨 Key Features Walkthrough

### Landing Page
- Hero section with animated gradients
- Feature highlights with icons and descriptions
- Statistics showcase
- Benefits section
- Call-to-action sections
- Responsive navigation

### Authentication
- Sign up / Sign in pages (powered by Clerk)
- Social login support
- Secure session management
- Role-based access control

### Student Dashboard
- Personalized welcome
- Progress statistics cards
- Continue learning section
- Quick actions sidebar
- Learning streak tracker

### Course Browser
- Search functionality
- Category and level filters
- Grid layout with course cards
- Real-time filtering
- Course previews

### Course Player
- Cinema mode video player
- Curriculum sidebar with progress
- AI Tutor chat panel
- Lesson navigation
- Progress marking

### Instructor Dashboard
- Course management
- Student analytics
- Revenue tracking
- Course creation wizard
- Rich course editor

## 🔐 Authentication Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy your publishable key and secret key
4. Add them to your .env files
5. Configure allowed redirect URLs in Clerk dashboard

## 🎥 Video Setup (Optional)

1. Create a Mux account at https://mux.com
2. Generate API access tokens
3. Add tokens to your .env file
4. Videos will be automatically processed and streamed

## 💳 Payment Setup (Optional)

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Add keys to your .env file
4. Configure webhook endpoints

## 🤖 AI Tutor Setup

1. Get a Gemini API key from https://ai.google.dev
2. Add to your .env file
3. The AI tutor will use RAG to answer questions based on course content

## 🚢 Deployment

### Frontend (Vercel)
\`\`\`bash
cd client
npm run build
# Deploy to Vercel
\`\`\`

### Backend (Render/Railway/AWS)
\`\`\`bash
cd server
# Set environment variables in your hosting platform
# Deploy using your platform's CLI or git integration
\`\`\`

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow React best practices
- Use functional components and hooks
- Implement proper error handling
- Add loading states for async operations

### Commits
- Use conventional commit messages
- Keep commits focused and atomic
- Write descriptive commit messages

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run \`npx prisma generate\`

**Clerk Auth Error**
- Verify API keys are correct
- Check allowed redirect URLs in Clerk dashboard
- Ensure CORS is configured properly

**Port Already in Use**
- Change PORT in .env file
- Kill process using the port: \`npx kill-port 3000\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Clerk for authentication
- Mux for video streaming
- Google for Gemini AI
- Tailwind Labs for Tailwind CSS
- Vercel for hosting and Vite

## 📞 Support

For support, email support@nexuslms.com or join our Discord community.

---

Built with ❤️ by the Nexus Team
