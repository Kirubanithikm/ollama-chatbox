import { Router, Request, Response } from 'express';
import auth from '../middleware/auth'; // Ensure auth middleware is imported

const router = Router();

// Example protected route
router.get('/test', auth, (req: Request, res: Response) => {
  res.json({ message: `Welcome, ${req.user?.username || 'user'}! This is a protected chat route.` });
});

export default router;