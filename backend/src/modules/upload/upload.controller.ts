import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  generatePresignedUploadUrl,
  UploadFileParams,
} from "../../services/s3.service";

export async function getPresignedUploadUrl(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fileType, fileExtension, contentType } = req.body as {
      fileType?: "image" | "video";
      fileExtension?: string;
      contentType?: string;
    };

    if (!fileType || !fileExtension || !contentType) {
      return res.status(400).json({
        error: "fileType, fileExtension, and contentType are required",
      });
    }

    if (fileType !== "image" && fileType !== "video") {
      return res.status(400).json({
        error: "fileType must be 'image' or 'video'",
      });
    }

    // Validate file extensions
    const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const allowedVideoExtensions = ["mp4", "mov", "avi", "webm", "mkv"];

    const allowedExtensions =
      fileType === "image" ? allowedImageExtensions : allowedVideoExtensions;

    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid ${fileType} extension. Allowed: ${allowedExtensions.join(", ")}`,
      });
    }

    // Validate content types
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
      "video/x-matroska",
    ];

    const validTypes = fileType === "image" ? validImageTypes : validVideoTypes;

    if (!validTypes.includes(contentType)) {
      return res.status(400).json({
        error: `Invalid ${fileType} content type`,
      });
    }

    const params: UploadFileParams = {
      userId: req.user.id,
      fileType,
      fileExtension: fileExtension.toLowerCase(),
      contentType,
    };

    const result = await generatePresignedUploadUrl(params);

    res.json(result);
  } catch (error) {
    console.error("Get presigned URL error:", error);
    res.status(500).json({
      error: "Failed to generate upload URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
