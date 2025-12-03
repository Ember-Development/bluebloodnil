import { Router } from 'express';
import {
  getMyProfile,
  getAllAthletes,
  getAthleteById,
  updateMyProfile,
  updateSocialProfiles,
  updateInterests,
  completeOnboarding,
  createMilestone,
  getMyTodos,
  verifyTodo,
  getAvailableCampaigns,
  applyToCampaign,
  getAthleteFeedPosts,
  getPublicOrganizations,
} from './athletes.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const athletesRouter = Router();

// Protected endpoints (require authentication) - must come before /:id
athletesRouter.get('/me/profile', authMiddleware, getMyProfile);
athletesRouter.put('/me/profile', authMiddleware, updateMyProfile);
athletesRouter.put('/me/social-profiles', authMiddleware, updateSocialProfiles);
athletesRouter.put('/me/interests', authMiddleware, updateInterests);
athletesRouter.post('/me/complete-onboarding', authMiddleware, completeOnboarding);
athletesRouter.post('/me/milestones', authMiddleware, createMilestone);
athletesRouter.get('/me/todos', authMiddleware, getMyTodos);
athletesRouter.post('/me/todos/:id/verify', authMiddleware, verifyTodo);
athletesRouter.get('/campaigns/available', authMiddleware, getAvailableCampaigns);
athletesRouter.post('/campaigns/:id/apply', authMiddleware, applyToCampaign);

// Public endpoints
athletesRouter.get('/', getAllAthletes);
athletesRouter.get('/organizations', getPublicOrganizations);
athletesRouter.get('/:id/feed-posts', getAthleteFeedPosts);
athletesRouter.get('/:id', getAthleteById);

