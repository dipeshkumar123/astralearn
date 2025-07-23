# 🚀 **AstraLearn v2 Production Deployment Guide**

## **📋 Overview**

This guide provides comprehensive instructions for deploying AstraLearn v2 to production with optimal performance, security, and scalability.

---

## **🔧 Prerequisites**

### **System Requirements**
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v5.0 or higher (or MongoDB Atlas)
- **Redis**: v6.0 or higher (for caching and sessions)
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Domain**: Configured domain with DNS pointing to your server

### **Server Specifications**
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Operating System**: Ubuntu 20.04 LTS or CentOS 8

---

## **🗄️ Database Migration**

### **1. MongoDB Setup**

#### **Option A: MongoDB Atlas (Recommended)**
```bash
# 1. Create MongoDB Atlas cluster
# 2. Configure network access (whitelist your server IP)
# 3. Create database user with read/write permissions
# 4. Get connection string

# Example connection string:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astralearn?retryWrites=true&w=majority
```

#### **Option B: Self-Hosted MongoDB**
```bash
# Install MongoDB on Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use astralearn
db.createUser({
  user: "astralearn_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "astralearn" }]
})
```

### **2. Data Migration Script**
```javascript
// server/scripts/migrate-to-production.js
const { MongoClient } = require('mongodb');

async function migrateData() {
  const devUri = 'mongodb://localhost:27017/astralearn-v2';
  const prodUri = process.env.MONGODB_URI;
  
  const devClient = new MongoClient(devUri);
  const prodClient = new MongoClient(prodUri);
  
  try {
    await devClient.connect();
    await prodClient.connect();
    
    const devDb = devClient.db();
    const prodDb = prodClient.db();
    
    // Migrate collections
    const collections = ['users', 'courses', 'enrollments', 'progress'];
    
    for (const collectionName of collections) {
      const data = await devDb.collection(collectionName).find({}).toArray();
      if (data.length > 0) {
        await prodDb.collection(collectionName).insertMany(data);
        console.log(`✅ Migrated ${data.length} documents to ${collectionName}`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await devClient.close();
    await prodClient.close();
  }
}

migrateData();
```

---

## **⚡ Performance Optimization**

### **1. Database Optimization**

#### **Indexes Creation**
```javascript
// server/scripts/create-indexes.js
const { MongoClient } = require('mongodb');

async function createIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Course indexes
    await db.collection('courses').createIndex({ title: 'text', description: 'text' });
    await db.collection('courses').createIndex({ category: 1, difficulty: 1 });
    await db.collection('courses').createIndex({ instructorId: 1 });
    await db.collection('courses').createIndex({ isPublished: 1, createdAt: -1 });
    
    // Enrollment indexes
    await db.collection('enrollments').createIndex({ userId: 1, courseId: 1 }, { unique: true });
    await db.collection('enrollments').createIndex({ userId: 1 });
    await db.collection('enrollments').createIndex({ courseId: 1 });
    
    // Progress indexes
    await db.collection('progress').createIndex({ userId: 1, lessonId: 1 }, { unique: true });
    await db.collection('progress').createIndex({ userId: 1, status: 1 });
    
    // Forum indexes
    await db.collection('forumPosts').createIndex({ courseId: 1, createdAt: -1 });
    await db.collection('forumPosts').createIndex({ authorId: 1 });
    await db.collection('forumPosts').createIndex({ title: 'text', content: 'text' });
    
    console.log('✅ All indexes created successfully!');
  } catch (error) {
    console.error('❌ Index creation failed:', error);
  } finally {
    await client.close();
  }
}

createIndexes();
```

### **2. Redis Caching Setup**
```bash
# Install Redis on Ubuntu
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl restart redis.service
sudo systemctl enable redis
```

### **3. Application Performance**

#### **Caching Middleware**
```javascript
// server/middleware/cache.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cache;
```

#### **Database Connection Pooling**
```javascript
// server/config/database.js
const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }
  
  async connect() {
    try {
      this.client = new MongoClient(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Database connected with connection pooling');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }
  
  getDb() {
    return this.db;
  }
  
  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = new Database();
```

---

## **🔒 Security Hardening**

### **1. Environment Variables**
```bash
# Copy production environment file
cp .env.production .env

# Update with actual production values
nano .env
```

### **2. SSL Certificate Setup**
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Firewall Configuration**
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # Block direct access to Node.js
```

### **4. Nginx Reverse Proxy**
```nginx
# /etc/nginx/sites-available/astralearn
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Frontend
    location / {
        root /var/www/astralearn/dist;
        try_files $uri $uri/ /index.html;
        
        # Caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

---

## **🚀 Deployment Process**

### **1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo adduser astralearn
sudo usermod -aG sudo astralearn
```

### **2. Application Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/astralearn.git
cd astralearn/astralearn-v2

# Install dependencies
npm install --production

# Build frontend
cd client
npm install
npm run build
cd ..

# Copy environment file
cp .env.production .env

# Run database migrations
node server/scripts/create-indexes.js

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **3. PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'astralearn-api',
    script: 'server/simple-test-server.cjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

---

## **📊 Monitoring & Maintenance**

### **1. Health Checks**
```javascript
// server/routes/health.js
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'disconnected',
    redis: 'disconnected'
  };
  
  try {
    // Check database
    await db.admin().ping();
    health.database = 'connected';
    
    // Check Redis
    await redisClient.ping();
    health.redis = 'connected';
    
    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    health.error = error.message;
    res.status(503).json(health);
  }
});
```

### **2. Logging Setup**
```javascript
// server/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### **3. Backup Strategy**
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/astralearn"
DB_NAME="astralearn"

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/db_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/db_$DATE"

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

---

## **✅ Post-Deployment Checklist**

- [ ] **SSL Certificate**: HTTPS working correctly
- [ ] **Database**: Connected and indexed
- [ ] **Redis**: Caching operational
- [ ] **PM2**: Application running in cluster mode
- [ ] **Nginx**: Reverse proxy configured
- [ ] **Firewall**: Properly configured
- [ ] **Monitoring**: Health checks responding
- [ ] **Backups**: Automated backup script running
- [ ] **DNS**: Domain pointing to server
- [ ] **Performance**: Load testing completed
- [ ] **Security**: Vulnerability scan passed

---

## **🔧 Troubleshooting**

### **Common Issues**
1. **Database Connection**: Check MongoDB URI and network access
2. **SSL Issues**: Verify certificate paths and domain configuration
3. **Performance**: Monitor memory usage and enable caching
4. **CORS Errors**: Update CORS_ORIGIN in environment variables

### **Useful Commands**
```bash
# Check application logs
pm2 logs astralearn-api

# Monitor performance
pm2 monit

# Restart application
pm2 restart astralearn-api

# Check database connection
mongo $MONGODB_URI

# Test API endpoints
curl -k https://yourdomain.com/api/health
```

---

**🎉 Congratulations! AstraLearn v2 is now deployed to production with enterprise-grade performance and security!**
