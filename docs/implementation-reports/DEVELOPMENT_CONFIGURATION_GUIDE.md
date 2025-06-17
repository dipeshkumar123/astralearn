# 🔧 Development Configuration Guide
## AstraLearn - Local Development Setup

### ✅ **Current Status: FIXED**
The Redis connection errors have been resolved. The application now runs in development mode without requiring Redis.

---

## 🚀 **Quick Start (Current Configuration)**

Both client and server are now running successfully:
- **Client**: http://localhost:3000
- **Server**: http://localhost:5000
- **Redis**: Disabled for development

### **Commands:**
```bash
# Run both client and server
npm run dev

# Or run individually:
npm run dev:server  # Server only
npm run dev:client  # Client only
```

---

## ⚙️ **Configuration Options**

### **Option 1: Development Mode (Current - No Redis)**
**Perfect for:** Local development, testing features without caching
```env
REDIS_ENABLED=false
REDIS_URL=
```
**Status:** ✅ **Currently Active**

### **Option 2: Local Redis (Full Features)**
**Perfect for:** Testing production features locally
```bash
# Install Redis (Windows)
# Option A: Using Chocolatey
choco install redis-64

# Option B: Using WSL2
wsl --install
wsl
sudo apt update && sudo apt install redis-server
redis-server

# Then update .env:
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

### **Option 3: Docker Development Environment**
**Perfect for:** Production-like environment
```bash
# Start full development stack
docker-compose up

# This includes:
# - MongoDB
# - Redis  
# - Traefik (reverse proxy)
# - Monitoring (Prometheus, Grafana)
```

---

## 🔧 **Environment Configuration**

### **Current `.env` Settings:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/astralearn

# Redis Configuration (DISABLED)
REDIS_ENABLED=false
REDIS_URL=
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Configuration
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### **Services Status:**
- ✅ **MongoDB**: Connected and operational
- ⚠️ **Redis**: Disabled (no caching)
- ✅ **WebSocket**: Enabled for real-time features
- ✅ **Performance Monitoring**: Active
- ✅ **AI Services**: Configured and ready

---

## 🎯 **What's Working Now**

### **✅ Available Features:**
- Course Management System
- Adaptive Learning Engine
- Assessment System
- AI-Powered Assistance
- Real-time Collaboration (WebSocket)
- Performance Monitoring
- Production Deployment Infrastructure

### **⚠️ Limited Features (No Redis):**
- User session caching (falls back to memory)
- API response caching (disabled)
- Analytics data caching (computed real-time)
- Real-time data caching (memory only)

---

## 🚀 **Next Steps**

### **Immediate Development:**
1. **Continue with Phase 4** - Gamification & Social Learning
2. **Test existing features** at http://localhost:3000
3. **API testing** at http://localhost:5000/api

### **Optional Redis Setup (Later):**
If you want to test caching features:
1. Install Redis locally OR use Docker
2. Update `.env`: `REDIS_ENABLED=true`
3. Update `.env`: `REDIS_URL=redis://localhost:6379`
4. Restart the server

### **Production Deployment:**
The Docker Compose configuration includes Redis and is ready for production deployment.

---

## 🛠️ **Troubleshooting**

### **If you see Redis errors again:**
1. Check `.env` file: `REDIS_ENABLED=false`
2. Restart the server: `npm run dev:server`
3. Clear any cached configurations

### **If you want to enable Redis:**
1. Install Redis (see options above)
2. Update `.env`: `REDIS_ENABLED=true`
3. Update `.env`: `REDIS_URL=redis://localhost:6379`
4. Restart: `npm run dev`

### **MongoDB Connection Issues:**
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env`
3. Verify port 27017 is available

---

## 📊 **Feature Comparison**

| Feature | Without Redis | With Redis |
|---------|---------------|------------|
| **Core Functionality** | ✅ Full | ✅ Full |
| **Performance** | ✅ Good | ✅ Excellent |
| **Session Management** | ✅ Memory-based | ✅ Persistent |
| **API Caching** | ❌ None | ✅ Fast responses |
| **Analytics** | ✅ Real-time | ✅ Cached + Real-time |
| **Production Ready** | ⚠️ Limited scaling | ✅ Full scaling |

---

**🎉 You're all set for development! The application is running smoothly without Redis.**

*Last Updated: December 2024*
