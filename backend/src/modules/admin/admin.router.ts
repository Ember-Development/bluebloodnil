import { Router } from 'express';
import {
  updateAthleteBrandPositioning,
  updateAthleteScenarioIdeas,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  assignAthletesToCampaign,
  closeCampaign,
  acceptCampaignApplication,
  denyCampaignApplication,
  deleteCampaign,
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(authMiddleware);

// Organizations (Brands)
adminRouter.get('/organizations', getAllOrganizations);
adminRouter.post('/organizations', createOrganization);
adminRouter.put('/organizations/:id', updateOrganization);
adminRouter.delete('/organizations/:id', deleteOrganization);

// Campaigns
adminRouter.get('/campaigns', getAllCampaigns);
adminRouter.post('/campaigns', createCampaign);
adminRouter.put('/campaigns/:id', updateCampaign);
adminRouter.post('/campaigns/:id/assign-athletes', assignAthletesToCampaign);
adminRouter.post('/campaigns/:id/close', closeCampaign);
adminRouter.post('/campaigns/:campaignId/applications/:participantId/accept', acceptCampaignApplication);
adminRouter.post('/campaigns/:campaignId/applications/:participantId/deny', denyCampaignApplication);
adminRouter.delete('/campaigns/:id', deleteCampaign);

// Todos
adminRouter.get('/todos', getAllTodos);
adminRouter.post('/todos', createTodo);
adminRouter.put('/todos/:id', updateTodo);
adminRouter.delete('/todos/:id', deleteTodo);

// Athlete brand positioning
adminRouter.put('/athletes/:athleteId/brand-positioning', updateAthleteBrandPositioning);

// Athlete scenario ideas
adminRouter.put('/athletes/:athleteId/scenario-ideas', updateAthleteScenarioIdeas);

