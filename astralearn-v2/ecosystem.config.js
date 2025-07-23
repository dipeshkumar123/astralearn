/**
 * PM2 Ecosystem Configuration for AstraLearn v2
 * Production-ready process management configuration
 */

module.exports = {
  apps: [
    {
      // Main API Server
      name: 'astralearn-api',
      script: 'server/simple-test-server.cjs',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001
      },
      
      // Logging
      error_file: './logs/api-err.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Performance & Memory Management
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Disable in production
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced PM2 features
      merge_logs: true,
      combine_logs: true,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Listen timeout
      listen_timeout: 8000,
      
      // Graceful shutdown
      shutdown_with_message: true
    },
    
    {
      // Background Job Processor (if needed)
      name: 'astralearn-jobs',
      script: 'server/workers/job-processor.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'jobs'
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'jobs'
      },
      
      // Logging
      error_file: './logs/jobs-err.log',
      out_file: './logs/jobs-out.log',
      log_file: './logs/jobs-combined.log',
      time: true,
      
      // Memory management
      max_memory_restart: '512M',
      
      // Auto-restart
      autorestart: true,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s',
      
      // Cron restart (restart daily at 3 AM)
      cron_restart: '0 3 * * *'
    },
    
    {
      // WebSocket Server (if using real-time features)
      name: 'astralearn-websocket',
      script: 'server/websocket/server.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WS_PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        WS_PORT: 8080
      },
      
      // Logging
      error_file: './logs/ws-err.log',
      out_file: './logs/ws-out.log',
      log_file: './logs/ws-combined.log',
      time: true,
      
      // Memory management
      max_memory_restart: '256M',
      
      // Auto-restart
      autorestart: true,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'astralearn',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/astralearn.git',
      path: '/var/www/astralearn',
      
      // Pre-deploy commands
      'pre-deploy-local': '',
      
      // Post-receive commands
      'post-deploy': 'npm install --production && ' +
                    'cd client && npm install && npm run build && cd .. && ' +
                    'pm2 reload ecosystem.config.js --env production && ' +
                    'pm2 save',
      
      // Pre-setup commands
      'pre-setup': 'apt update -y && apt install git -y',
      
      // Post-setup commands
      'post-setup': 'ls -la',
      
      // Environment
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'astralearn',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/yourusername/astralearn.git',
      path: '/var/www/astralearn-staging',
      
      'post-deploy': 'npm install && ' +
                    'cd client && npm install && npm run build && cd .. && ' +
                    'pm2 reload ecosystem.config.js --env staging && ' +
                    'pm2 save',
      
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};

/**
 * PM2 Commands Reference:
 * 
 * Start all applications:
 * pm2 start ecosystem.config.js
 * 
 * Start with specific environment:
 * pm2 start ecosystem.config.js --env production
 * 
 * Reload all applications:
 * pm2 reload ecosystem.config.js
 * 
 * Stop all applications:
 * pm2 stop ecosystem.config.js
 * 
 * Delete all applications:
 * pm2 delete ecosystem.config.js
 * 
 * Monitor applications:
 * pm2 monit
 * 
 * View logs:
 * pm2 logs
 * pm2 logs astralearn-api
 * 
 * Save PM2 configuration:
 * pm2 save
 * 
 * Setup startup script:
 * pm2 startup
 * 
 * Deploy to production:
 * pm2 deploy production
 * 
 * Deploy to staging:
 * pm2 deploy staging
 */
