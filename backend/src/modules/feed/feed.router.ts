import { Router } from "express";
import {
  getFeedPosts,
  getTrendingAthletes,
  getFeaturedCampaign,
} from "./feed.controller";
import { optionalAuthMiddleware } from "../../middleware/auth.middleware";

export const feedRouter = Router();

// Feed routes allow guest access (optional authentication)
feedRouter.use(optionalAuthMiddleware);

feedRouter.get("/posts", getFeedPosts);
feedRouter.get("/trending-athletes", getTrendingAthletes);
feedRouter.get("/featured-campaign", getFeaturedCampaign);
