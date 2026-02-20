# AstraLearn v2.0 - Complete Rebuild

## 🚀 Overview
This is a complete rebuild of the AstraLearn platform with improved architecture, better code organization, and enhanced maintainability while preserving all existing functionality.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
server/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic layer
│   ├── repositories/     # Data access layer
│   ├── models/          # Database schemas
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript definitions
│   └── events/          # Event emitters
├── tests/               # Test suites
└── scripts/             # Utility scripts
```

### Frontend (React + TypeScript + Vite)
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature-based modules
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and external services
│   ├── stores/          # State management (Zustand)
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript definitions
│   └── assets/          # Static assets
├── tests/               # Test suites
└── public/              # Public assets
```

### Shared
```
shared/
├── types/               # Shared TypeScript definitions
├── utils/               # Shared utility functions
└── constants/           # Shared constants
```

## 🎯 Key Improvements

### Code Organization
- **Feature-based structure**: Related code grouped together
- **Clear separation of concerns**: Controllers, services, repositories
- **Consistent patterns**: Standardized approaches throughout

### Performance
- **Efficient data fetching**: Optimized queries and caching
- **Component optimization**: Memoization and lazy loading
- **Bundle optimization**: Code splitting and tree shaking

### Developer Experience
- **TypeScript**: Full type safety across the stack
- **Comprehensive testing**: Unit, integration, and E2E tests
- **Development tools**: Hot reload, debugging, linting

### Scalability
- **Modular architecture**: Easy to extend and maintain
- **Event-driven design**: Decoupled components
- **Caching strategy**: Multi-level caching implementation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+
- Docker (optional)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd astralearn-v2

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Start with Docker
docker-compose up -d

# Or start manually
npm run start:prod
```

## 📚 Features Preserved

All existing AstraLearn features are preserved and enhanced:

- ✅ **Multi-role authentication** (Student, Instructor, Admin)
- ✅ **Course management** with modules and lessons
- ✅ **AI-powered assistance** with GROQ integration
- ✅ **Adaptive learning** paths and assessments
- ✅ **Gamification** system with points and badges
- ✅ **Social learning** features and collaboration
- ✅ **Analytics and reporting** dashboards
- ✅ **Real-time features** with WebSocket support

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **AI**: GROQ SDK
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Testing**: Vitest + Supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Reverse Proxy**: Nginx/Traefik
- **CI/CD**: GitHub Actions

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Frontend Guide](./docs/frontend.md)
- [Backend Guide](./docs/backend.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

Please read our [Contributing Guide](./docs/contributing.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the AstraLearn Team**
