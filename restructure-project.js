#!/usr/bin/env node

/**
 * AstraLearn Project Restructuring Script
 * Automated cleanup and reorganization of the project structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ASTRALEARN PROJECT RESTRUCTURING');
console.log('========================================================');

const projectRoot = process.cwd();
let moveCount = 0;
let removeCount = 0;

// Helper function to move files
const moveFile = (src, dest) => {
  try {
    const srcPath = path.join(projectRoot, src);
    const destPath = path.join(projectRoot, dest);
    
    if (fs.existsSync(srcPath)) {
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.renameSync(srcPath, destPath);
      console.log(`✅ Moved: ${src} → ${dest}`);
      moveCount++;
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error moving ${src}: ${error.message}`);
    return false;
  }
};

// Helper function to remove files
const removeFile = (filePath) => {
  try {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Removed: ${filePath}`);
      removeCount++;
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error removing ${filePath}: ${error.message}`);
    return false;
  }
};

console.log('\\n1️⃣ Moving Documentation Files...');
const docFiles = [
  'AI_CHAT_FIX_COMPLETION_REPORT.md',
  'AI_Infrastructure_Summary.md',
  'AI_Orchestration_Summary.md',
  'AI_TEMPLATE_PLACEHOLDER_FIX_REPORT.md',
  'AUTHENTICATION_FLOW_COMPLETION_REPORT.md',
  'AUTHENTICATION_IMPLEMENTATION_COMPLETE.md',
  'COMPREHENSIVE_FIX_COMPLETION_REPORT.md',
  'DASHBOARD_ERROR_HANDLING_COMPLETION_REPORT.md',
  'DEVELOPMENT_CONFIGURATION_GUIDE.md',
  'DEVELOPMENT_ISSUES_FIXED.md',
  'FINAL_COMPREHENSIVE_FIXES_REPORT.md',
  'FINAL_DASHBOARD_AI_FIXES_COMPLETION_REPORT.md',
  'FINAL_VALIDATION_REPORT.md',
  'Frontend_AI_Interface_Summary.md',
  'FRONTEND_BACKEND_INTEGRATION_COMPLETION_REPORT.md',
  'PHASE_2_COMPLETION_SUMMARY.md',
  'PHASE3_STEP1_COMPLETION_SUMMARY.md',
  'PHASE3_STEP1_TESTING_REPORT.md',
  'PHASE3_STEP2_COMPLETION_SUMMARY.md',
  'PHASE3_STEP2_FINAL_COMPLETION_REPORT.md',
  'PHASE3_STEP2_IMPLEMENTATION_PLAN.md',
  'PHASE3_STEP3_COMPLETION_SUMMARY.md',
  'PHASE3_STEP3_IMPLEMENTATION_PLAN.md',
  'PHASE4_IMPLEMENTATION_PLAN.md',
  'PHASE4_STEP2_COMPLETION_SUMMARY.md',
  'PHASE4_STEP2_FINAL_COMPLETION_REPORT.md',
  'PHASE4_STEP3_COMPLETION_SUMMARY.md',
  'PHASE4_STEP3_FINAL_COMPLETION_REPORT.md',
  'PHASE4_STEP3_IMPLEMENTATION_PLAN.md',
  'PHASE5_ANALYTICS_PREPARATION.md',
  'PHASE5_STEP1_IMPLEMENTATION_PLAN.md',
  'PHASE5_STEP2_COMPLETION_SUMMARY.md',
  'PHASE5_STEP2_IMPLEMENTATION_PLAN.md',
  'PHASE6_FINAL_COMPLETION_SUMMARY.md',
  'PHASE6_TESTING_DEPLOYMENT_PLAN.md',
  'PRODUCTION_DEPLOYMENT_GUIDE.md',
  'PROJECT_RESTRUCTURING_COMPLETION_REPORT.md',
  'PROJECT_RESTRUCTURING_PLAN.md',
  'PROJECT_STATUS_COMPREHENSIVE_REPORT.md',
  'SESSION_COMPLETION_SUMMARY.md'
];

docFiles.forEach(file => {
  moveFile(file, `docs/implementation-reports/${file}`);
});

console.log('\\n2️⃣ Moving Test Files...');
const testFiles = [
  'test-achievement-system.js',
  'test-adaptive-learning.js',
  'test-ai-chat-fix.js',
  'test-ai-response-content.js',
  'test-api-simple.js',
  'test-auth-complete.js',
  'test-auth-detailed.js',
  'test-auth-integration.js',
  'test-complete-auth-flow.js',
  'test-course-api.js',
  'test-dashboard-comprehensive.js',
  'test-database-context.js',
  'test-endpoints-detailed.js',
  'test-endpoints-fix.js',
  'test-fixed-endpoints.js',
  'test-frontend-api-comprehensive.js',
  'test-frontend-api-comprehensive-fixed.js',
  'test-frontend-integration.js',
  'test-gamification-integration.js',
  'test-login-only.js',
  'test-orchestrated-chat.js',
  'test-production-suite.js',
  'test-template-fix.js',
  'test-websocket-auth.js',
  'test-websocket-auth-fix.js',
  'test-websocket-simple.js',
  'test-websocket-simple-auth.js',
  'simple-frontend-test.js',
  'quick-auth-test.js',
  'quick-debug.js',
  'quick-status-check.js',
  'final-fix-verification.js',
  'final-integration-validation.js',
  'final-validation-test.js',
  'project-issue-analyzer.js'
];

testFiles.forEach(file => {
  moveFile(file, `testing/${file}`);
});

console.log('\\n3️⃣ Moving Debug/Utility Files...');
const debugFiles = [
  'check-ai-health.js',
  'check-database-content.js',
  'check-users.js',
  'createSampleData.js',
  'debug-adaptive.js',
  'debug-ai-context.js',
  'debug-auth.js',
  'debug-failing-endpoints.js',
  'debug-instructor.js'
];

debugFiles.forEach(file => {
  moveFile(file, `testing/debug/${file}`);
});

console.log('\\n4️⃣ Moving Validation Files...');
const validateFiles = [
  'validate-ai-chat-integration.js',
  'validate-frontend-fix.js',
  'validate-frontend-integration.js',
  'validate-phase3-step2.js',
  'validate-phase4-step2.js',
  'validate-phase4-step3.js',
  'validate-phase6.js'
];

validateFiles.forEach(file => {
  moveFile(file, `testing/validation/${file}`);
});

console.log('\\n5️⃣ Removing Duplicate Files...');
const duplicatesToRemove = [
  'client/src/App-optimized.jsx',  // Keep App.jsx
  'client/src/App.tsx',            // Keep App.jsx  
  'client/src/main.tsx',           // Keep main.jsx
  'server/src/index.ts',           // Keep index.js
  'server/src/services/gamificationService.js.backup',
  'server/src/services/gamification-temp.js'
];

duplicatesToRemove.forEach(file => {
  removeFile(file);
});

console.log('\\n6️⃣ Creating Project Documentation...');

// Create main project README
const mainReadme = `# AstraLearn - AI-Powered Learning Platform

## 🎯 Overview
AstraLearn is a comprehensive AI-powered learning platform featuring adaptive learning paths, gamification, social collaboration, and advanced analytics.

## 🏗️ Project Structure

\`\`\`
AstraLearn/
├── client/                 # React Frontend Application
├── server/                 # Node.js Backend API
├── shared/                 # Shared utilities and types
├── docs/                   # Project documentation
├── testing/                # Test files and utilities
├── k8s/                    # Kubernetes deployment configs
└── scripts/                # Build and deployment scripts
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd AstraLearn
\`\`\`

2. Install dependencies
\`\`\`bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies  
cd ../server && npm install
\`\`\`

3. Environment Setup
\`\`\`bash
# Copy environment files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit environment variables as needed
\`\`\`

4. Start Development Servers
\`\`\`bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
\`\`\`

## 📖 Documentation

- [API Documentation](docs/api/)
- [Implementation Reports](docs/implementation-reports/)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)

## 🧪 Testing

\`\`\`bash
# Run test suite
npm test

# Run specific tests
cd testing && node <test-file.js>
\`\`\`

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
`;

fs.writeFileSync(path.join(projectRoot, 'README.md'), mainReadme);
console.log('✅ Created comprehensive README.md');

// Create development guide
const devGuide = `# Development Guide

## 🛠️ Development Environment Setup

### Required Tools
- Node.js 18.0+ 
- MongoDB 5.0+
- Git
- VS Code (recommended)

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- GitLens

## 🏗️ Project Structure Deep Dive

### Frontend Architecture (\`client/\`)

\`\`\`
client/src/
├── components/          # React components organized by feature
│   ├── adaptive/       # Adaptive learning components
│   ├── ai/            # AI assistant and related features
│   ├── analytics/     # Analytics dashboards and charts
│   ├── auth/          # Authentication components  
│   ├── course/        # Course management and viewing
│   ├── dashboard/     # User dashboards (student/instructor/admin)
│   ├── gamification/  # Badges, achievements, leaderboards
│   └── social/        # Social learning features
├── services/          # API communication layer
├── contexts/          # React context providers
├── hooks/            # Custom React hooks
└── utils/            # Utility functions
\`\`\`

### Backend Architecture (\`server/src/\`)

\`\`\`
server/src/
├── routes/            # API endpoint definitions
├── services/          # Business logic and external integrations
├── models/           # MongoDB schemas and models
├── middleware/       # Express middleware (auth, validation, etc.)
├── config/           # Configuration files
└── utils/            # Utility functions and helpers
\`\`\`

## 🔄 Development Workflow

### 1. Feature Development
1. Create feature branch from \`main\`
2. Develop feature with tests
3. Test locally with full stack
4. Submit pull request
5. Code review and merge

### 2. Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints  
- Component tests for React components
- End-to-end tests for user flows

### 3. Code Quality
- ESLint for code linting
- Prettier for code formatting
- Conventional commits for commit messages
- Code reviews for all changes

## 🧪 Testing Guidelines

### Running Tests
\`\`\`bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test

# Integration tests
cd testing && node test-integration.js
\`\`\`

### Test Organization
- \`testing/\` - Integration and system tests
- \`client/src/tests/\` - Frontend unit tests
- \`server/src/tests/\` - Backend unit tests

## 🔧 Common Development Tasks

### Adding New Components
1. Create component in appropriate feature folder
2. Add to index.js for easy importing
3. Create accompanying test file
4. Update storybook if applicable

### Adding New API Endpoints
1. Define route in appropriate router file
2. Implement business logic in service layer
3. Add input validation middleware
4. Create integration test
5. Update API documentation

### Database Changes
1. Update model schemas
2. Create migration script if needed
3. Update seed data
4. Test with fresh database

## 🐛 Debugging

### Frontend Debugging
- Use React Developer Tools
- Console logging for state changes
- Network tab for API calls
- Redux DevTools for state management

### Backend Debugging
- Use \`console.log\` strategically
- MongoDB Compass for database inspection
- Postman for API testing
- VS Code debugger for step-through debugging

## 📝 Documentation Standards

### Code Documentation
- JSDoc comments for functions
- README files for major components
- Inline comments for complex logic
- Architecture decision records (ADRs)

### API Documentation
- OpenAPI/Swagger specifications
- Example requests and responses
- Error code documentation
- Authentication requirements

## 🚀 Performance Guidelines

### Frontend Performance
- Lazy load components where appropriate
- Optimize bundle size with code splitting
- Use React.memo for expensive components
- Minimize re-renders with useCallback/useMemo

### Backend Performance
- Database query optimization
- Implement caching where appropriate
- Use connection pooling
- Monitor API response times

## 🔒 Security Best Practices

### Frontend Security
- Sanitize user inputs
- Use HTTPS in production
- Implement proper authentication flows
- Protect against XSS attacks

### Backend Security
- Input validation on all endpoints
- Proper authentication and authorization
- Rate limiting on public endpoints
- SQL injection prevention
- Secure environment variable handling

## 🌍 Environment Management

### Development
- Local MongoDB instance
- Hot reloading enabled
- Debug logging enabled
- Mock external services

### Staging
- Production-like environment
- Real external service integration
- Performance monitoring
- Automated testing

### Production
- Optimized builds
- Production database
- Error monitoring
- Performance tracking
- Backup procedures

## 📊 Monitoring and Analytics

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- User analytics
- System health checks

### Development Metrics
- Code coverage reports
- Build time optimization
- Bundle size tracking
- API response time monitoring
`;

fs.writeFileSync(path.join(projectRoot, 'docs/development.md'), devGuide);
console.log('✅ Created development guide');

console.log('\\n📊 RESTRUCTURING SUMMARY:');
console.log('========================================================');
console.log(`📁 Files moved: ${moveCount}`);
console.log(`🗑️  Files removed: ${removeCount}`);
console.log('✅ Documentation created');
console.log('✅ Project structure optimized');

console.log('\\n🎯 NEXT STEPS:');
console.log('1. Review moved files and update any import paths');
console.log('2. Update package.json scripts if needed'); 
console.log('3. Test application functionality');
console.log('4. Update CI/CD pipelines for new structure');
console.log('5. Update team documentation and onboarding guides');

console.log('\\n✅ Project restructuring complete!');
