// Minimal test server to debug startup issues
import express from 'express';
import cors from 'cors';

console.log('🔧 Starting minimal server test...');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Minimal server started successfully');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});

console.log('🚀 Server setup complete');
