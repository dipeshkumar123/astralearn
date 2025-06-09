# AstraLearn - Advanced LMS with Context-Aware AI

## Overview
AstraLearn is an advanced Learning Management System (LMS) that leverages context-aware AI to provide personalized learning experiences. The system understands user context, learning progress, and course material to deliver intelligent assistance throughout the learning journey.

## Architecture
- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenRouter API for context-aware responses
- **Real-time**: Socket.IO for live features
- **Caching**: Redis for performance optimization

## Prerequisites
- Node.js v18+ 
- npm v9+
- MongoDB Atlas account (or local MongoDB v6+)
- Redis (optional, for caching)

## Environment Configuration

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Setup
Copy environment examples and configure:

**Server (.env)**:
```bash
cd server
cp .env.example .env
```

**Client (.env)**:
```bash
cd client  
cp .env.example .env
```

### 3. MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update `MONGODB_URI` in `server/.env`

### 4. API Keys Setup
- Get OpenRouter API key from https://openrouter.ai/
- Update `OPENROUTER_API_KEY` in `server/.env`
- Configure other API keys as needed

## Development

### Start Development Servers
```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:client    # Frontend on http://localhost:3000
npm run dev:server    # Backend on http://localhost:5000
```

### Build for Production
```bash
npm run build
```

### Testing
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared types and utilities
├── package.json     # Root workspace configuration
└── plan.md         # Detailed implementation plan
```

## Development Phases

### ✅ Phase 1: Foundation Setup (Current)
- [x] Environment Configuration
- [ ] Core Architecture
- [ ] AI Infrastructure

### Phase 2: Context-Aware AI System
- [ ] Context Gathering Engine
- [ ] AI Orchestration Layer  
- [ ] Frontend AI Interface

### Phase 3: Learning Core
- [ ] Course Management
- [ ] Adaptive Learning Engine
- [ ] Assessment System

### Phase 4: Engagement Features
- [ ] Gamification System
- [ ] Social Learning

### Phase 5: Analytics & Insights
- [ ] Dashboard Framework
- [ ] Instructor Tools

### Phase 6: Testing & Deployment
- [ ] Quality Assurance
- [ ] Deployment Pipeline

## Contributing
1. Create feature branch from `develop`
2. Make changes following the established patterns
3. Test thoroughly
4. Submit pull request to `develop`

## License
MIT License - see LICENSE file for details
