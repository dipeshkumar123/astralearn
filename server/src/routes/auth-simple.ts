import { Router } from 'express';

const router = Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth test route works' });
});

export default router;
