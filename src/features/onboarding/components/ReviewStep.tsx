import { useAuth } from '../../../contexts/AuthContext';
import type { OnboardingFormData } from '../types';
import './ReviewStep.css';

interface ReviewStepProps {
  formData: OnboardingFormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({ formData, onBack, onSubmit, isSubmitting }: ReviewStepProps) {
  const { user } = useAuth();
  const athlete = user?.athlete;

  return (
    <div className="onboarding-step review-step">
      <div className="step-header">
        <h2>Review Your Profile</h2>
        <p>Please review your information before completing your profile.</p>
      </div>

      <div className="review-sections">
        <section className="review-section">
          <h3>Basic Information</h3>
          <div className="review-content">
            <div className="review-item">
              <span className="review-label">Name:</span>
              <span className="review-value">{athlete?.name || `${athlete?.firstName || ''} ${athlete?.lastName || ''}`.trim()}</span>
            </div>
            {formData.location && (
              <div className="review-item">
                <span className="review-label">Location:</span>
                <span className="review-value">{formData.location}</span>
              </div>
            )}
            {formData.sport && (
              <div className="review-item">
                <span className="review-label">Sport:</span>
                <span className="review-value">{formData.sport}</span>
              </div>
            )}
            {formData.primaryPosition && (
              <div className="review-item">
                <span className="review-label">Primary Position:</span>
                <span className="review-value">{formData.primaryPosition}</span>
              </div>
            )}
            {formData.school && (
              <div className="review-item">
                <span className="review-label">School:</span>
                <span className="review-value">{formData.school}</span>
              </div>
            )}
            {formData.bio && (
              <div className="review-item review-item-full">
                <span className="review-label">Bio:</span>
                <p className="review-value">{formData.bio}</p>
              </div>
            )}
          </div>
        </section>

        {formData.socialProfiles && formData.socialProfiles.length > 0 && (
          <section className="review-section">
            <h3>Social Media Profiles</h3>
            <div className="review-content">
              {formData.socialProfiles.map((profile, index) => (
                <div key={index} className="review-item review-item-full">
                  <div className="social-profile-review">
                    <span className="social-platform-badge">{profile.platform}</span>
                    <span className="review-value">@{profile.handle}</span>
                    {profile.followers > 0 && (
                      <span className="review-meta">
                        {profile.followers.toLocaleString()} followers
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {formData.interests && formData.interests.length > 0 && (
          <section className="review-section">
            <h3>Interests</h3>
            <div className="review-interests">
              {formData.interests.map((interest, index) => (
                <span key={index} className="interest-tag">
                  {interest.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {formData.avatarUrl && (
          <section className="review-section">
            <h3>Profile Photo</h3>
            <div className="review-photo">
              <img src={formData.avatarUrl} alt="Profile" />
            </div>
          </section>
        )}

        {formData.videoUrl && (
          <section className="review-section">
            <h3>Video</h3>
            <div className="review-content">
              <div className="review-item review-item-full">
                <a
                  href={formData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-accentSoft)',
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                  }}
                >
                  {formData.videoUrl}
                </a>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
        <button className="btn-primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Completing...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}

