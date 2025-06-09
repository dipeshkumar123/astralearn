import { Router } from 'express';

const router = Router();

// Test route without dependencies
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route works' });
});

export default router;
