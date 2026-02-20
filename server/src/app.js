const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { clerkMiddleware } = require('@clerk/express');
const { apiRateLimiter, securityHeaders, attachRequestId } = require('./middleware/security');

// Load env: root then server-level
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.disable('x-powered-by');

// CORS
const corsOriginRaw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOrigins = corsOriginRaw.split(',').map(s => s.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(attachRequestId);
app.use(securityHeaders);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiRateLimiter);

// Public health before auth
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Clerk auth
app.use(clerkMiddleware());

// Routers
app.use('/api/courses', require('./routes/courses'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/mux', require('./routes/mux'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/stripe', require('./routes/stripe'));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, _next) => {
  console.error(`[${req.requestId || 'no-request-id'}] Unhandled error:`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    requestId: req.requestId,
  });
});

module.exports = app;
