import { useState, useEffect } from 'react';
import type { OnboardingFormData, SocialProfileInput } from '../types';
import './SocialProfilesStep.css';

interface SocialProfilesStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLATFORMS: Array<{ value: SocialProfileInput['platform']; label: string; icon: string }> = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'x', label: 'X (Twitter)', icon: '🐦' },
];

export function SocialProfilesStep({ formData, onUpdate, onNext, onBack }: SocialProfilesStepProps) {
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileInput[]>(
    formData.socialProfiles || []
  );

  const handleAddProfile = () => {
    setSocialProfiles([
      ...socialProfiles,
      {
        platform: 'instagram',
        handle: '',
        followers: 0,
        avgEngagementRate: 0,
        avgViews: 0,
      },
    ]);
  };

  const handleRemoveProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = (index: number, updates: Partial<SocialProfileInput>) => {
    setSocialProfiles(
      socialProfiles.map((profile, i) => (i === index ? { ...profile, ...updates } : profile))
    );
  };

  const handleNext = () => {
    // Filter out empty profiles
    const validProfiles = socialProfiles.filter((p) => p.handle.trim() !== '');
    onUpdate({ socialProfiles: validProfiles });
    onNext();
  };

  return (
    <div className="onboarding-step social-profiles-step">
      <div className="step-header">
        <h2>Social Media Profiles</h2>
        <p>Add your social media accounts to showcase your reach and engagement.</p>
      </div>

      <div className="step-form">
        {socialProfiles.map((profile, index) => (
          <div key={index} className="social-profile-card">
            <div className="social-profile-header">
              <select
                value={profile.platform}
                onChange={(e) =>
                  handleUpdateProfile(index, {
                    platform: e.target.value as SocialProfileInput['platform'],
                  })
                }
                className="platform-select"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
              {socialProfiles.length > 0 && (
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveProfile(index)}
                  aria-label="Remove profile"
                >
                  ×
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Handle</label>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(e) => handleUpdateProfile(index, { handle: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div className="form-group">
                <label>Followers</label>
                <input
                  type="number"
                  value={profile.followers || ''}
                  onChange={(e) =>
                    handleUpdateProfile(index, { followers: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Avg. Engagement Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.avgEngagementRate || ''}
                  onChange={(e) =>
                    handleUpdateProfile(index, {
                      avgEngagementRate: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="0.0"
                />
              </div>
              <div className="form-group">
                <label>Avg. Views</label>
                <input
                  type="number"
                  value={profile.avgViews || ''}
                  onChange={(e) =>
                    handleUpdateProfile(index, { avgViews: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Posting Cadence</label>
              <input
                type="text"
                value={profile.postingCadence || ''}
                onChange={(e) => handleUpdateProfile(index, { postingCadence: e.target.value })}
                placeholder="e.g., 4-5 posts per week"
              />
            </div>
          </div>
        ))}

        <button className="btn-add" onClick={handleAddProfile}>
          + Add Social Media Profile
        </button>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

