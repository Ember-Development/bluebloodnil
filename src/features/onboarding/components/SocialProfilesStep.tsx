import { useState } from "react";
import type { OnboardingFormData, SocialProfileInput } from "../types";
import "./SocialProfilesStep.css";

interface SocialProfilesStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Platform icons as SVG components
const InstagramIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      fill="currentColor"
    />
  </svg>
);

const TikTokIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.07 6.07 0 0 0-1-.08A6.24 6.24 0 0 0 5 20.1a6.31 6.31 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      fill="currentColor"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="currentColor"
    />
  </svg>
);

const PLATFORMS: Array<{
  value: SocialProfileInput["platform"];
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "instagram", label: "Instagram", icon: <InstagramIcon /> },
  { value: "tiktok", label: "TikTok", icon: <TikTokIcon /> },
  { value: "youtube", label: "YouTube", icon: <YouTubeIcon /> },
  { value: "x", label: "X (Twitter)", icon: <XIcon /> },
];

const POSTING_CADENCE_OPTIONS = [
  "Daily",
  "4-5 posts per week",
  "2-3 posts per week",
  "Weekly",
  "2-3 posts per month",
  "Monthly",
  "Occasionally",
  "Never",
];

export function SocialProfilesStep({
  formData,
  onUpdate,
  onNext,
  onBack,
}: SocialProfilesStepProps) {
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileInput[]>(
    formData.socialProfiles || []
  );

  const handleAddProfile = () => {
    setSocialProfiles([
      ...socialProfiles,
      {
        platform: "instagram",
        handle: "",
        postingCadence: "",
      },
    ]);
  };

  const handleRemoveProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = (
    index: number,
    updates: Partial<SocialProfileInput>
  ) => {
    setSocialProfiles(
      socialProfiles.map((profile, i) =>
        i === index ? { ...profile, ...updates } : profile
      )
    );
  };

  const handleNext = () => {
    // Filter out empty profiles
    const validProfiles = socialProfiles.filter((p) => p.handle.trim() !== "");
    onUpdate({ socialProfiles: validProfiles });
    onNext();
  };

  return (
    <div className="onboarding-step social-profiles-step">
      <div className="step-header">
        <h2>Social Media Profiles</h2>
        <p>
          Add your social media accounts to showcase your reach and engagement.
        </p>
      </div>

      <div className="step-form">
        {socialProfiles.map((profile, index) => (
          <div key={index} className="social-profile-card">
            <div className="social-profile-header">
              <select
                value={profile.platform}
                onChange={(e) =>
                  handleUpdateProfile(index, {
                    platform: e.target.value as SocialProfileInput["platform"],
                  })
                }
                className="platform-select"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
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

            {/* Display icon next to the selected platform */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                padding: "var(--space-sm)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span style={{ color: "var(--color-text)" }}>
                {PLATFORMS.find((p) => p.value === profile.platform)?.icon}
              </span>
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
                {PLATFORMS.find((p) => p.value === profile.platform)?.label}
              </span>
            </div>

            <div className="form-group">
              <label>Handle</label>
              <input
                type="text"
                value={profile.handle}
                onChange={(e) =>
                  handleUpdateProfile(index, { handle: e.target.value })
                }
                placeholder="@username"
              />
            </div>

            <div className="form-group">
              <label>Posting Cadence</label>
              <select
                className="platform-select"
                value={profile.postingCadence || ""}
                onChange={(e) =>
                  handleUpdateProfile(index, { postingCadence: e.target.value })
                }
              >
                <option value="">Select posting cadence...</option>
                {POSTING_CADENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
