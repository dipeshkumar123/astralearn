# AstraLearn - AI-Powered Learning Platform

## 🎯 Overview
AstraLearn is a comprehensive AI-powered learning platform featuring adaptive learning paths, gamification, social collaboration, and advanced analytics.

## 🏗️ Project Structure

```
AstraLearn/
├── client/                 # React Frontend Application
├── server/                 # Node.js Backend API
├── shared/                 # Shared utilities and types
├── docs/                   # Project documentation
├── testing/                # Test files and utilities
├── k8s/                    # Kubernetes deployment configs
└── scripts/                # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AstraLearn
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies  
cd ../server && npm install
```

3. Environment Setup
```bash
# Copy environment files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit environment variables as needed
```

4. Start Development Servers
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

## 📖 Documentation

- [API Documentation](docs/api/)
- [Implementation Reports](docs/implementation-reports/)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)

## 🧪 Testing

```bash
# Run test suite
npm test

# Run specific tests
cd testing && node <test-file.js>
```

## 🏛️ Architecture

### Frontend (React)
- **Components**: Modular UI components organized by feature
- **Services**: API communication layer
- **Contexts**: State management for cross-component data
- **Hooks**: Custom React hooks for reusable logic

### Backend (Node.js/Express)
- **Routes**: API endpoint definitions
- **Services**: Business logic and external service integration
- **Models**: Database schemas and data models
- **Middleware**: Authentication, authorization, and request processing

## 🔧 Development

### Code Organization
- Follow feature-based folder structure
- Use TypeScript where applicable
- Implement proper error handling
- Write comprehensive tests

### Best Practices
- Use ESLint and Prettier for code formatting
- Follow semantic versioning
- Write meaningful commit messages
- Update documentation with changes

## 📦 Deployment

See [Production Deployment Guide](docs/deployment.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[License information here]

## 📞 Support

For support and questions, please [create an issue](../../issues) or contact the development team.
