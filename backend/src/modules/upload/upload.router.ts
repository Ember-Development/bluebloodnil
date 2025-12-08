import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getPresignedUploadUrl } from "./upload.controller";

export const uploadRouter = Router();

uploadRouter.use(authMiddleware);
uploadRouter.post("/presigned-url", getPresignedUploadUrl);
