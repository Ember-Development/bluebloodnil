import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    athleteId?: string;
  };
}

/**
 * Mock authentication middleware for development
 * Looks for userId in header or query param
 * In production, this should verify JWT tokens or session
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // For now, use simple header or query param authentication
    // TODO: Replace with proper JWT/session authentication
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athlete: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      athleteId: user.athlete?.id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth middleware - doesn't fail if no user
 * Useful for endpoints that work with or without auth
 */
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          athlete: {
            select: { id: true },
          },
        },
      });

      if (user) {
        req.userId = user.id;
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          athleteId: user.athlete?.id,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
}

