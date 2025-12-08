import { useState } from "react";
import type { OnboardingFormData } from "../types";
import { apiClient } from "../../../lib/apiClient";
import "./ProfilePhotoStep.css";

interface ProfilePhotoStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type VideoInputMode = "upload" | "url";

export function ProfilePhotoStep({
  formData,
  onUpdate,
  onNext,
  onBack,
}: ProfilePhotoStepProps) {
  const [avatarUrl, setAvatarUrl] = useState(formData.avatarUrl || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    formData.avatarUrl || null
  );
  const [videoUrl, setVideoUrl] = useState(formData.videoUrl || "");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    formData.videoUrl || null
  );
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>(
    formData.videoUrl && !formData.videoUrl.startsWith("http")
      ? "upload"
      : "url"
  );
  const [videoUrlInput, setVideoUrlInput] = useState(
    formData.videoUrl && formData.videoUrl.startsWith("http")
      ? formData.videoUrl
      : ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const uploadFile = async (
    file: File,
    fileType: "image" | "video"
  ): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL from backend
      const fileExtension = getFileExtension(file.name);
      const { uploadUrl, fileUrl } = await apiClient.post<{
        uploadUrl: string;
        fileUrl: string;
        key: string;
      }>("/api/upload/presigned-url", {
        fileType,
        fileExtension,
        contentType: file.type,
      });

      // Step 2: Upload file directly to S3
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setUploadProgress(100);
      return fileUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB for images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const uploadedUrl = await uploadFile(file, "image");
      setAvatarUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      setUploadError(null);
    } catch (error) {
      console.error("Image upload error:", error);
      setPreviewUrl(null);
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (100MB for videos)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setUploadError("Video size must be less than 100MB");
      return;
    }

    try {
      const uploadedUrl = await uploadFile(file, "video");
      setVideoUrl(uploadedUrl);
      setVideoPreviewUrl(uploadedUrl);
      setUploadError(null);
    } catch (error) {
      console.error("Video upload error:", error);
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrlInput(url);

    // Validate URL format
    if (url && !isValidUrl(url)) {
      setUploadError("Please enter a valid URL");
      return;
    }

    setUploadError(null);

    if (url) {
      setVideoUrl(url);
      setVideoPreviewUrl(url);
    } else {
      setVideoUrl("");
      setVideoPreviewUrl(null);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleVideoModeChange = (mode: VideoInputMode) => {
    setVideoInputMode(mode);
    // Clear video when switching modes
    if (mode === "upload") {
      setVideoUrlInput("");
    } else {
      setVideoUrl("");
      setVideoPreviewUrl(null);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setAvatarUrl("");
  };

  const handleRemoveVideo = () => {
    setVideoPreviewUrl(null);
    setVideoUrl("");
    setVideoUrlInput("");
  };

  const handleNext = () => {
    onUpdate({ avatarUrl, videoUrl: videoUrl || undefined });
    onNext();
  };

  return (
    <div className="onboarding-step profile-photo-step">
      <div className="step-header">
        <h2>Profile Photo & Video</h2>
        <p>Upload a photo and optional video to personalize your profile.</p>
      </div>

      <div className="step-form">
        {/* Image Upload */}
        <div className="photo-upload-area">
          {previewUrl ? (
            <div className="photo-preview">
              <img src={previewUrl} alt="Profile preview" />
              <button className="btn-remove-photo" onClick={handleRemovePhoto}>
                Remove Photo
              </button>
            </div>
          ) : (
            <div className="photo-upload-placeholder">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p>Click to upload or drag and drop</p>
              <p className="photo-upload-hint">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="photo-upload-input"
                id="avatar-upload"
                disabled={isUploading}
              />
              <label htmlFor="avatar-upload" className="photo-upload-label">
                {isUploading ? "Uploading..." : "Choose File"}
              </label>
            </div>
          )}
        </div>

        {isUploading && uploadProgress > 0 && (
          <div className="upload-progress">
            <div
              className="upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
            <span>{uploadProgress}%</span>
          </div>
        )}

        {uploadError && (
          <div
            className="upload-error"
            style={{
              color: "var(--color-danger)",
              marginTop: "var(--space-sm)",
            }}
          >
            {uploadError}
          </div>
        )}

        <div className="photo-upload-note">
          <p>
            Your profile photo helps brands connect with you. Use a clear,
            professional image.
          </p>
        </div>

        {/* Video Section */}
        <div className="form-group" style={{ marginTop: "var(--space-xl)" }}>
          <label className="form-label">
            Video (Optional)
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--color-muted)",
                fontWeight: "normal",
                marginLeft: "0.5rem",
              }}
            >
              Share a highlight reel or introduction video
            </span>
          </label>

          {/* Video Input Mode Toggle */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              marginTop: "var(--space-sm)",
              marginBottom: "var(--space-sm)",
            }}
          >
            <button
              type="button"
              onClick={() => handleVideoModeChange("upload")}
              className={
                videoInputMode === "upload" ? "btn-primary" : "btn-secondary"
              }
              style={{
                fontSize: "0.9rem",
                padding: "var(--space-xs) var(--space-sm)",
              }}
              disabled={isUploading}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleVideoModeChange("url")}
              className={
                videoInputMode === "url" ? "btn-primary" : "btn-secondary"
              }
              style={{
                fontSize: "0.9rem",
                padding: "var(--space-xs) var(--space-sm)",
              }}
              disabled={isUploading}
            >
              Paste URL
            </button>
          </div>

          {videoPreviewUrl ? (
            <div style={{ marginTop: "var(--space-sm)" }}>
              <video
                src={videoPreviewUrl}
                controls
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--space-sm)",
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRemoveVideo}
                style={{ fontSize: "0.9rem" }}
              >
                Remove Video
              </button>
            </div>
          ) : (
            <>
              {videoInputMode === "upload" ? (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="form-input"
                    style={{ marginTop: "var(--space-xs)" }}
                    disabled={isUploading}
                  />
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-muted)",
                      marginTop: "var(--space-xs)",
                    }}
                  >
                    MP4, MOV, AVI up to 100MB
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={videoUrlInput}
                    onChange={handleVideoUrlChange}
                    style={{ marginTop: "var(--space-xs)" }}
                    disabled={isUploading}
                  />
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-muted)",
                      marginTop: "var(--space-xs)",
                    }}
                  >
                    Paste a link to YouTube, Vimeo, or any video hosting service
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Next"}
        </button>
      </div>
    </div>
  );
}
