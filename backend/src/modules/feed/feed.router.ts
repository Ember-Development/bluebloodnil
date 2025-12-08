import { Router } from "express";
import {
  getFeedPosts,
  getTrendingAthletes,
  getFeaturedCampaign,
} from "./feed.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export const feedRouter = Router();

// Feed routes require authentication
feedRouter.use(authMiddleware);

feedRouter.get("/posts", getFeedPosts);
feedRouter.get("/trending-athletes", getTrendingAthletes);
feedRouter.get("/featured-campaign", getFeaturedCampaign);
