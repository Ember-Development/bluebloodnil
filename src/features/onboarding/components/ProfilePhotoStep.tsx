import { useState } from 'react';
import type { OnboardingFormData } from '../types';
import './ProfilePhotoStep.css';

interface ProfilePhotoStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProfilePhotoStep({ formData, onUpdate, onNext, onBack }: ProfilePhotoStepProps) {
  const [avatarUrl, setAvatarUrl] = useState(formData.avatarUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.avatarUrl || null);
  const [videoUrl, setVideoUrl] = useState(formData.videoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a preview URL
      // In production, upload to cloud storage and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setAvatarUrl(result); // For now, using data URL. Replace with actual upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setAvatarUrl('');
  };

  const handleNext = () => {
    onUpdate({ avatarUrl, videoUrl: videoUrl || undefined });
    onNext();
  };

  return (
    <div className="onboarding-step profile-photo-step">
      <div className="step-header">
        <h2>Profile Photo</h2>
        <p>Upload a photo to personalize your profile.</p>
      </div>

      <div className="step-form">
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
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p>Click to upload or drag and drop</p>
              <p className="photo-upload-hint">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="photo-upload-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="photo-upload-label">
                Choose File
              </label>
            </div>
          )}
        </div>

        <div className="photo-upload-note">
          <p>Your profile photo helps brands connect with you. Use a clear, professional image.</p>
        </div>

        <div className="form-group" style={{ marginTop: 'var(--space-xl)' }}>
          <label className="form-label">
            Video Link (Optional)
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              Share a highlight reel or introduction video
            </span>
          </label>
          <input
            type="url"
            className="form-input"
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{ marginTop: 'var(--space-xs)' }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 'var(--space-xs)' }}>
            Paste a link to YouTube, Vimeo, or any video hosting service
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Next'}
        </button>
      </div>
    </div>
  );
}

