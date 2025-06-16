/**
 * Project Structure Reorganizer for AstraLearn
 * 
 * This script reorganizes the project structure for better maintainability:
 * - Organizes files by feature/domain
 * - Creates clear separation of concerns
 * - Implements consistent naming conventions
 * - Adds proper documentation structure
 * - Sets up development and deployment configurations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

class ProjectStructureReorganizer {
  constructor() {
    this.newStructure = {
      // Root level organization
      docs: {
        api: {},
        deployment: {},
        development: {},
        user: {}
      },
      scripts: {
        database: {},
        deployment: {},
        development: {},
        testing: {}
      },
      
      // Server organization
      server: {
        src: {
          api: {
            v1: {
              controllers: {},
              middleware: {},
              routes: {},
              validators: {}
            }
          },
          core: {
            config: {},
            database: {},
            utils: {},
            types: {}
          },
          features: {
            auth: {
              controllers: {},
              middleware: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            },
            courses: {
              controllers: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            },
            gamification: {
              controllers: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            },
            social: {
              controllers: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            },
            analytics: {
              controllers: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            },
            ai: {
              controllers: {},
              models: {},
              routes: {},
              services: {},
              validators: {}
            }
          },
          shared: {
            constants: {},
            enums: {},
            interfaces: {},
            types: {},
            utils: {}
          },
          realtime: {
            events: {},
            handlers: {},
            services: {}
          }
        },
        tests: {
          unit: {},
          integration: {},
          e2e: {},
          fixtures: {},
          helpers: {}
        }
      },
      
      // Client organization
      client: {
        src: {
          components: {
            common: {},
            features: {
              auth: {},
              courses: {},
              dashboard: {},
              gamification: {},
              social: {},
              analytics: {}
            },
            layout: {},
            ui: {}
          },
          hooks: {
            api: {},
            state: {},
            utils: {}
          },
          services: {
            api: {},
            auth: {},
            realtime: {},
            storage: {}
          },
          store: {
            slices: {},
            middleware: {},
            types: {}
          },
          utils: {
            constants: {},
            helpers: {},
            types: {},
            validation: {}
          },
          styles: {
            components: {},
            globals: {},
            themes: {}
          }
        },
        tests: {
          components: {},
          hooks: {},
          services: {},
          utils: {},
          __mocks__: {}
        }
      },
      
      // Shared between client and server
      shared: {
        types: {},
        constants: {},
        schemas: {},
        utils: {}
      }
    };

    this.fileMappings = [];
    this.operationLog = [];
  }

  /**
   * Analyze current structure and create reorganization plan
   */
  async analyzeCurrentStructure() {
    console.log('🔍 Analyzing current project structure...');
    
    try {
      const serverFiles = await this.getDirectoryContents(path.join(projectRoot, 'server/src'));
      const clientFiles = await this.getDirectoryContents(path.join(projectRoot, 'client/src'));
      
      console.log(`   📁 Server files: ${serverFiles.length}`);
      console.log(`   📁 Client files: ${clientFiles.length}`);
      
      // Analyze file types and suggest mappings
      await this.createFileMappings(serverFiles, clientFiles);
      
      console.log(`✅ Analysis complete - ${this.fileMappings.length} files to reorganize`);
      return true;
    } catch (error) {
      console.error('❌ Failed to analyze structure:', error);
      return false;
    }
  }

  async getDirectoryContents(dirPath, basePath = '') {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          const subFiles = await this.getDirectoryContents(fullPath, relativePath);
          files.push(...subFiles);
        } else {
          files.push({
            name: item,
            path: fullPath,
            relativePath: relativePath,
            size: stat.size,
            type: path.extname(item)
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission issues
      console.warn(`⚠️  Cannot read directory: ${dirPath}`);
    }
    
    return files;
  }

  async createFileMappings(serverFiles, clientFiles) {
    console.log('📋 Creating file mapping plan...');

    // Map server files
    for (const file of serverFiles) {
      const newPath = this.mapServerFile(file);
      if (newPath) {
        this.fileMappings.push({
          source: file.path,
          destination: path.join(projectRoot, 'server/src', newPath),
          type: 'server',
          action: 'move'
        });
      }
    }

    // Map client files
    for (const file of clientFiles) {
      const newPath = this.mapClientFile(file);
      if (newPath) {
        this.fileMappings.push({
          source: file.path,
          destination: path.join(projectRoot, 'client/src', newPath),
          type: 'client',
          action: 'move'
        });
      }
    }

    console.log(`   📊 ${this.fileMappings.filter(m => m.type === 'server').length} server files to reorganize`);
    console.log(`   📊 ${this.fileMappings.filter(m => m.type === 'client').length} client files to reorganize`);
  }

  mapServerFile(file) {
    const { relativePath, name } = file;
    
    // Skip certain files/directories
    if (name.includes('node_modules') || name.includes('.git') || name.includes('dist')) {
      return null;
    }

    // Map based on current path and file type
    if (relativePath.includes('routes/')) {
      return this.mapServerRoute(relativePath, name);
    } else if (relativePath.includes('models/')) {
      return this.mapServerModel(relativePath, name);
    } else if (relativePath.includes('services/')) {
      return this.mapServerService(relativePath, name);
    } else if (relativePath.includes('middleware/')) {
      return this.mapServerMiddleware(relativePath, name);
    } else if (relativePath.includes('config/')) {
      return `core/config/${name}`;
    } else if (relativePath.includes('utils/')) {
      return `core/utils/${name}`;
    }

    return null;
  }

  mapServerRoute(relativePath, name) {
    // Determine feature based on filename
    if (name.includes('auth')) {
      return `features/auth/routes/${name}`;
    } else if (name.includes('course') || name.includes('module') || name.includes('lesson')) {
      return `features/courses/routes/${name}`;
    } else if (name.includes('gamification')) {
      return `features/gamification/routes/${name}`;
    } else if (name.includes('social')) {
      return `features/social/routes/${name}`;
    } else if (name.includes('analytics')) {
      return `features/analytics/routes/${name}`;
    } else if (name.includes('ai')) {
      return `features/ai/routes/${name}`;
    } else {
      return `api/v1/routes/${name}`;
    }
  }

  mapServerModel(relativePath, name) {
    if (name.includes('User')) {
      return `features/auth/models/${name}`;
    } else if (name.includes('Course') || name.includes('Module') || name.includes('Lesson')) {
      return `features/courses/models/${name}`;
    } else if (name.includes('Gamification') || name.includes('Badge') || name.includes('Achievement')) {
      return `features/gamification/models/${name}`;
    } else if (name.includes('Social') || name.includes('StudyGroup') || name.includes('Discussion')) {
      return `features/social/models/${name}`;
    } else if (name.includes('Analytics')) {
      return `features/analytics/models/${name}`;
    } else {
      return `shared/models/${name}`;
    }
  }

  mapServerService(relativePath, name) {
    if (name.includes('auth')) {
      return `features/auth/services/${name}`;
    } else if (name.includes('course') || name.includes('module') || name.includes('lesson')) {
      return `features/courses/services/${name}`;
    } else if (name.includes('gamification')) {
      return `features/gamification/services/${name}`;
    } else if (name.includes('social')) {
      return `features/social/services/${name}`;
    } else if (name.includes('analytics')) {
      return `features/analytics/services/${name}`;
    } else if (name.includes('ai') || name.includes('openrouter')) {
      return `features/ai/services/${name}`;
    } else if (name.includes('webSocket') || name.includes('realtime')) {
      return `realtime/services/${name}`;
    } else {
      return `shared/services/${name}`;
    }
  }

  mapServerMiddleware(relativePath, name) {
    if (name.includes('auth')) {
      return `features/auth/middleware/${name}`;
    } else {
      return `api/v1/middleware/${name}`;
    }
  }

  mapClientFile(file) {
    const { relativePath, name } = file;
    
    // Skip certain files
    if (name.includes('node_modules') || name.includes('.git') || name.includes('dist')) {
      return null;
    }

    if (relativePath.includes('components/')) {
      return this.mapClientComponent(relativePath, name);
    } else if (relativePath.includes('services/')) {
      return `services/${this.categorizeClientService(name)}/${name}`;
    } else if (relativePath.includes('hooks/')) {
      return `hooks/${this.categorizeClientHook(name)}/${name}`;
    } else if (relativePath.includes('utils/')) {
      return `utils/helpers/${name}`;
    } else if (relativePath.includes('contexts/')) {
      return `store/contexts/${name}`;
    }

    return null;
  }

  mapClientComponent(relativePath, name) {
    if (name.includes('Dashboard')) {
      return `components/features/dashboard/${name}`;
    } else if (name.includes('Auth') || name.includes('Login') || name.includes('Register')) {
      return `components/features/auth/${name}`;
    } else if (name.includes('Course') || name.includes('Module') || name.includes('Lesson')) {
      return `components/features/courses/${name}`;
    } else if (name.includes('Gamification') || name.includes('Badge') || name.includes('Leaderboard')) {
      return `components/features/gamification/${name}`;
    } else if (name.includes('Social') || name.includes('StudyGroup') || name.includes('Chat')) {
      return `components/features/social/${name}`;
    } else if (name.includes('Analytics') || name.includes('Chart') || name.includes('Report')) {
      return `components/features/analytics/${name}`;
    } else if (name.includes('Header') || name.includes('Footer') || name.includes('Sidebar') || name.includes('Layout')) {
      return `components/layout/${name}`;
    } else if (name.includes('Button') || name.includes('Input') || name.includes('Modal') || name.includes('Card')) {
      return `components/ui/${name}`;
    } else {
      return `components/common/${name}`;
    }
  }

  categorizeClientService(name) {
    if (name.includes('api') || name.includes('Api')) {
      return 'api';
    } else if (name.includes('auth')) {
      return 'auth';
    } else if (name.includes('socket') || name.includes('realtime')) {
      return 'realtime';
    } else {
      return 'utils';
    }
  }

  categorizeClientHook(name) {
    if (name.includes('api') || name.includes('Api')) {
      return 'api';
    } else if (name.includes('state') || name.includes('State')) {
      return 'state';
    } else {
      return 'utils';
    }
  }

  /**
   * Create new directory structure
   */
  async createNewStructure() {
    console.log('📁 Creating new directory structure...');
    
    try {
      await this.createDirectories(this.newStructure, projectRoot);
      console.log('✅ New directory structure created');
      return true;
    } catch (error) {
      console.error('❌ Failed to create directories:', error);
      return false;
    }
  }

  async createDirectories(structure, basePath) {
    for (const [name, subStructure] of Object.entries(structure)) {
      const dirPath = path.join(basePath, name);
      
      try {
        await fs.mkdir(dirPath, { recursive: true });
        
        if (typeof subStructure === 'object' && Object.keys(subStructure).length > 0) {
          await this.createDirectories(subStructure, dirPath);
        }
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  /**
   * Execute file reorganization
   */
  async reorganizeFiles() {
    console.log('🔄 Reorganizing files...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const mapping of this.fileMappings) {
      try {
        await this.moveFile(mapping.source, mapping.destination);
        this.operationLog.push({
          type: 'success',
          operation: 'move',
          source: mapping.source,
          destination: mapping.destination
        });
        successCount++;
      } catch (error) {
        this.operationLog.push({
          type: 'error',
          operation: 'move',
          source: mapping.source,
          destination: mapping.destination,
          error: error.message
        });
        errorCount++;
        console.error(`   ❌ Failed to move ${path.basename(mapping.source)}:`, error.message);
      }
    }

    console.log(`✅ Reorganization complete: ${successCount} files moved, ${errorCount} errors`);
    return { successCount, errorCount };
  }

  async moveFile(source, destination) {
    // Ensure destination directory exists
    const destDir = path.dirname(destination);
    await fs.mkdir(destDir, { recursive: true });
    
    // Check if source file exists
    try {
      await fs.access(source);
    } catch (error) {
      throw new Error(`Source file does not exist: ${source}`);
    }
    
    // Move the file
    await fs.rename(source, destination);
  }

  /**
   * Create documentation files
   */
  async createDocumentation() {
    console.log('📚 Creating documentation structure...');
    
    const docs = [
      {
        path: 'docs/README.md',
        content: this.generateMainReadme()
      },
      {
        path: 'docs/api/README.md',
        content: this.generateApiDocumentation()
      },
      {
        path: 'docs/development/SETUP.md',
        content: this.generateSetupGuide()
      },
      {
        path: 'docs/development/STRUCTURE.md',
        content: this.generateStructureDocumentation()
      },
      {
        path: 'docs/deployment/DEPLOYMENT.md',
        content: this.generateDeploymentGuide()
      },
      {
        path: 'scripts/development/setup.js',
        content: this.generateSetupScript()
      },
      {
        path: 'scripts/database/seed.js',
        content: this.generateSeedScript()
      }
    ];

    for (const doc of docs) {
      try {
        const filePath = path.join(projectRoot, doc.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, doc.content);
        console.log(`   ✅ Created: ${doc.path}`);
      } catch (error) {
        console.error(`   ❌ Failed to create ${doc.path}:`, error.message);
      }
    }

    console.log('✅ Documentation created');
  }

  generateMainReadme() {
    return `# AstraLearn - Advanced Learning Management System

## 🎯 Overview

AstraLearn is a modern, AI-powered Learning Management System designed for real-time, collaborative learning experiences.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm run install:all

# Set up development environment
npm run setup:dev

# Seed database with sample data
npm run seed:comprehensive

# Start development servers
npm run dev
\`\`\`

## 📋 Features

- **Real-time Learning**: Live progress tracking and collaboration
- **AI Integration**: Context-aware AI assistance and recommendations
- **Gamification**: Badges, achievements, and leaderboards
- **Social Learning**: Study groups, discussions, and peer collaboration
- **Analytics**: Comprehensive learning analytics and insights
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📁 Project Structure

See [docs/development/STRUCTURE.md](docs/development/STRUCTURE.md) for detailed structure information.

## 🛠️ Development

See [docs/development/SETUP.md](docs/development/SETUP.md) for setup instructions.

## 🚀 Deployment

See [docs/deployment/DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md) for deployment guidelines.

## 📖 API Documentation

See [docs/api/README.md](docs/api/README.md) for API documentation.
`;
  }

  generateApiDocumentation() {
    return `# AstraLearn API Documentation

## Base URL
\`http://localhost:5000/api\`

## Authentication
All API endpoints require authentication via JWT token in the Authorization header:
\`Authorization: Bearer <token>\`

## Endpoints

### Authentication
- \`POST /auth/login\` - User login
- \`POST /auth/register\` - User registration
- \`POST /auth/refresh\` - Refresh access token

### Courses
- \`GET /courses\` - List all courses
- \`GET /courses/:id\` - Get course details
- \`POST /courses\` - Create new course
- \`PUT /courses/:id\` - Update course
- \`DELETE /courses/:id\` - Delete course

### User Progress
- \`GET /progress\` - Get user progress
- \`POST /progress\` - Update progress
- \`GET /progress/:courseId\` - Get course progress

### Gamification
- \`GET /gamification/profile\` - Get user gamification profile
- \`GET /gamification/leaderboard\` - Get leaderboard
- \`GET /gamification/badges\` - Get available badges

### Social Learning
- \`GET /social/study-groups\` - List study groups
- \`POST /social/study-groups\` - Create study group
- \`GET /social/discussions\` - List discussions
- \`POST /social/discussions\` - Create discussion

For detailed API specifications, see individual route files in \`server/src/features/*/routes/\`.
`;
  }

  generateSetupGuide() {
    return `# Development Setup Guide

## Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- Redis 6+ (optional, for caching)

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd astralearn
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm run install:all
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Edit configuration files
   nano server/.env
   nano client/.env
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Start MongoDB
   mongod
   
   # Seed database with comprehensive data
   npm run seed:comprehensive
   \`\`\`

5. **Start Development Servers**
   \`\`\`bash
   npm run dev
   \`\`\`

## Development Commands

- \`npm run dev\` - Start both client and server
- \`npm run dev:client\` - Start client only
- \`npm run dev:server\` - Start server only
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linting
- \`npm run build\` - Build for production

## Testing

- \`npm run test:unit\` - Unit tests
- \`npm run test:integration\` - Integration tests
- \`npm run test:e2e\` - End-to-end tests

## Real-time Simulation

To test real-time features:
\`\`\`bash
npm run simulate:realtime
\`\`\`
`;
  }

  generateStructureDocumentation() {
    return `# Project Structure

## Overview

AstraLearn follows a feature-based architecture with clear separation of concerns.

## Root Structure

\`\`\`
astralearn/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # Shared code/types
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── k8s/                    # Kubernetes configurations
\`\`\`

## Server Structure

\`\`\`
server/src/
├── api/v1/                 # API layer
│   ├── controllers/        # Route controllers
│   ├── middleware/         # API middleware
│   ├── routes/            # Route definitions
│   └── validators/        # Request validators
├── core/                  # Core functionality
│   ├── config/           # Configuration
│   ├── database/         # Database setup
│   └── utils/            # Core utilities
├── features/             # Feature modules
│   ├── auth/            # Authentication
│   ├── courses/         # Course management
│   ├── gamification/    # Gamification system
│   ├── social/          # Social learning
│   ├── analytics/       # Analytics engine
│   └── ai/              # AI integration
├── realtime/            # Real-time features
│   ├── events/          # Event definitions
│   ├── handlers/        # Event handlers
│   └── services/        # Real-time services
└── shared/              # Shared server code
    ├── constants/       # Constants
    ├── types/           # Type definitions
    └── utils/           # Shared utilities
\`\`\`

## Client Structure

\`\`\`
client/src/
├── components/           # React components
│   ├── common/          # Reusable components
│   ├── features/        # Feature-specific components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── hooks/               # Custom React hooks
│   ├── api/            # API hooks
│   ├── state/          # State management hooks
│   └── utils/          # Utility hooks
├── services/           # External services
│   ├── api/           # API services
│   ├── auth/          # Authentication
│   └── realtime/      # Real-time services
├── store/             # State management
│   ├── slices/        # Redux slices
│   └── middleware/    # Store middleware
└── utils/             # Utilities
    ├── constants/     # Constants
    ├── helpers/       # Helper functions
    └── validation/    # Validation schemas
\`\`\`

## Feature Organization

Each feature module contains:
- \`controllers/\` - Business logic
- \`models/\` - Data models
- \`routes/\` - API routes
- \`services/\` - Business services
- \`validators/\` - Input validation

## Design Principles

1. **Feature-based Organization**: Code organized by business domain
2. **Separation of Concerns**: Clear boundaries between layers
3. **Reusability**: Shared code in dedicated modules
4. **Scalability**: Structure supports horizontal scaling
5. **Maintainability**: Easy to navigate and modify
`;
  }

  generateDeploymentGuide() {
    return `# Deployment Guide

## Production Deployment

### Docker Deployment

1. **Build Images**
   \`\`\`bash
   docker-compose -f docker-compose.prod.yml build
   \`\`\`

2. **Deploy**
   \`\`\`bash
   docker-compose -f docker-compose.prod.yml up -d
   \`\`\`

### Kubernetes Deployment

1. **Apply Configurations**
   \`\`\`bash
   kubectl apply -f k8s/
   \`\`\`

2. **Check Status**
   \`\`\`bash
   kubectl get pods
   kubectl get services
   \`\`\`

### Environment Variables

Required environment variables for production:

#### Server
- \`NODE_ENV=production\`
- \`MONGODB_URI=<production-mongodb-uri>\`
- \`JWT_SECRET=<secure-jwt-secret>\`
- \`OPENROUTER_API_KEY=<ai-api-key>\`

#### Client
- \`VITE_API_URL=<production-api-url>\`
- \`VITE_WS_URL=<production-websocket-url>\`

## Monitoring

- **Health Checks**: \`/health\` endpoint
- **Metrics**: Prometheus metrics at \`/metrics\`
- **Logs**: Structured JSON logging

## Security

- HTTPS enforced in production
- Security headers via Helmet
- Rate limiting enabled
- Input validation on all endpoints
`;
  }

  generateSetupScript() {
    return `#!/usr/bin/env node

/**
 * Development Environment Setup Script
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up AstraLearn development environment...');

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });
execSync('npm run install:all', { stdio: 'inherit' });

// Copy environment files
console.log('⚙️  Setting up environment files...');
if (!fs.existsSync('server/.env')) {
  fs.copyFileSync('server/.env.example', 'server/.env');
  console.log('   ✅ Created server/.env');
}

if (!fs.existsSync('client/.env')) {
  fs.copyFileSync('client/.env.example', 'client/.env');
  console.log('   ✅ Created client/.env');
}

// Create necessary directories
console.log('📁 Creating directories...');
const dirs = [
  'server/uploads',
  'server/logs',
  'client/dist'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(\`   ✅ Created \${dir}\`);
  }
});

console.log('✅ Development environment setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Update server/.env with your configuration');
console.log('2. Update client/.env with your configuration');
console.log('3. Run: npm run seed:comprehensive');
console.log('4. Run: npm run dev');
`;
  }

  generateSeedScript() {
    return `#!/usr/bin/env node

/**
 * Database Seeding Script
 */

import ComprehensiveSeeder from '../server/src/scripts/comprehensiveSeed.js';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  const seeder = new ComprehensiveSeeder();
  
  try {
    await seeder.execute();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();
`;
  }

  /**
   * Update package.json scripts
   */
  async updatePackageScripts() {
    console.log('📝 Updating package.json scripts...');
    
    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      packageJson.scripts = {
        ...packageJson.scripts,
        "setup:dev": "node scripts/development/setup.js",
        "seed:comprehensive": "node scripts/database/seed.js",
        "simulate:realtime": "node server/src/scripts/realTimeSimulator.js",
        "test:unit": "npm run test --workspaces",
        "test:integration": "npm run test:integration --workspace=server",
        "test:e2e": "npm run test:e2e --workspace=client",
        "docs:serve": "npx serve docs",
        "clean": "npm run clean --workspaces",
        "reset": "npm run clean && npm run install:all && npm run setup:dev"
      };
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Package.json scripts updated');
    } catch (error) {
      console.error('❌ Failed to update package.json:', error);
    }
  }

  /**
   * Generate summary report
   */
  generateReport() {
    const successOperations = this.operationLog.filter(op => op.type === 'success').length;
    const errorOperations = this.operationLog.filter(op => op.type === 'error').length;
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 PROJECT REORGANIZATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successful operations: ${successOperations}`);
    console.log(`❌ Failed operations: ${errorOperations}`);
    console.log('');
    console.log('📁 New Structure Created:');
    console.log('   ✅ Feature-based organization');
    console.log('   ✅ Clear separation of concerns');
    console.log('   ✅ Comprehensive documentation');
    console.log('   ✅ Development scripts');
    console.log('   ✅ Deployment configurations');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Review moved files for correctness');
    console.log('   2. Update import paths in affected files');
    console.log('   3. Test the application thoroughly');
    console.log('   4. Update any build/deployment scripts');
    console.log('');
    console.log('📚 Documentation available in docs/ directory');
  }

  /**
   * Execute the complete reorganization
   */
  async execute() {
    console.log('🔄 Starting Project Structure Reorganization...');
    console.log('=' .repeat(60));
    
    try {
      // Analyze current structure
      const analyzed = await this.analyzeCurrentStructure();
      if (!analyzed) {
        throw new Error('Failed to analyze current structure');
      }

      // Create new structure
      const structureCreated = await this.createNewStructure();
      if (!structureCreated) {
        throw new Error('Failed to create new structure');
      }

      // Reorganize files
      await this.reorganizeFiles();

      // Create documentation
      await this.createDocumentation();

      // Update package.json
      await this.updatePackageScripts();

      // Generate report
      this.generateReport();

      console.log('✅ Project reorganization completed successfully!');
      
    } catch (error) {
      console.error('❌ Project reorganization failed:', error);
      throw error;
    }
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const reorganizer = new ProjectStructureReorganizer();
  reorganizer.execute().catch(console.error);
}

export default ProjectStructureReorganizer;
