import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface UploadFileParams {
  userId: string;
  fileType: "image" | "video";
  fileExtension: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function generatePresignedUploadUrl(
  params: UploadFileParams
): Promise<PresignedUrlResponse> {
  const { userId, fileType, fileExtension, contentType } = params;

  // Generate unique file key
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");
  const key = `${fileType}s/${userId}/${timestamp}-${randomId}.${fileExtension}`;

  // Generate presigned URL (valid for 5 minutes)
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Add ACL if needed
    // ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // Construct the public URL (adjust based on your S3 bucket configuration)
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a file
 */
export async function generatePresignedDownloadUrl(
  key: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
