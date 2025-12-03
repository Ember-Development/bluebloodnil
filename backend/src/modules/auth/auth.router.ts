import { Router } from 'express';
import { getCurrentUser, requestMagicLink, verifyMagicLink } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const authRouter = Router();

// Public routes
authRouter.post('/login', requestMagicLink);
authRouter.get('/verify/:token', verifyMagicLink);

// Protected route
authRouter.get('/me', authMiddleware, getCurrentUser);

