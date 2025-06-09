import { Router, Request, Response } from 'express';

const router = Router();

// Test route without dependencies
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth route works' });
});

export default router;
