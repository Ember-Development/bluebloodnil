import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/apiClient";
import { StepperProgress } from "./components/StepperProgress";
import { BasicInfoStep } from "./components/BasicInfoStep";
import { SocialProfilesStep } from "./components/SocialProfilesStep";
import { AboutYouStep } from "./components/AboutYouStep";
import { ProfilePhotoStep } from "./components/ProfilePhotoStep";
import { ReviewStep } from "./components/ReviewStep";
import type { OnboardingFormData, OnboardingStep } from "./types";
import "./onboarding.css";

export function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    socialProfiles: [],
    interests: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user profile is already complete, redirect
    if (user?.profileComplete) {
      navigate("/feed", { replace: true });
    }
  }, [user, navigate]);

  const handleUpdate = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user?.athlete) {
      setError("User profile not found");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Update basic profile info
      await apiClient.put("/api/athletes/me/profile", {
        location: formData.location,
        bio: formData.bio,
        sport: formData.sport,
        primaryPosition: formData.primaryPosition,
        school: formData.school,
        highSchool: formData.highSchool,
        avatarUrl: formData.avatarUrl,
        videoUrl: formData.videoUrl,
      });

      // Step 2: Update social profiles
      if (formData.socialProfiles && formData.socialProfiles.length > 0) {
        await apiClient.put("/api/athletes/me/social-profiles", {
          socialProfiles: formData.socialProfiles,
        });
      }

      // Step 3: Update interests
      if (formData.interests && formData.interests.length > 0) {
        await apiClient.put("/api/athletes/me/interests", {
          interests: formData.interests,
        });
      }

      // Step 4: Complete onboarding
      await apiClient.post("/api/athletes/me/complete-onboarding", {});

      // Refresh user data
      await refreshUser();

      // Redirect to feed
      navigate("/feed");
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete onboarding. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="onboarding-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <StepperProgress currentStep={currentStep} />

        <div className="onboarding-step-container">
          {error && (
            <div className="onboarding-error">
              <p>{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <SocialProfilesStep
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <AboutYouStep
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <ProfilePhotoStep
              formData={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              formData={formData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
