export interface OnboardingFormData {
  // Step 1: Basic Info
  location?: string;
  bio?: string;
  sport?: string;
  primaryPosition?: string;
  school?: string; // College commit (from Bomber Sync, read-only)
  highSchool?: string; // High school (manually entered)

  // Step 2: Social Profiles
  socialProfiles: SocialProfileInput[];

  // Step 3: About You (interests)
  interests: InterestInput[];

  // Step 4: Profile Photo
  avatarUrl?: string;
  videoUrl?: string; // Optional video link or upload URL
}

export interface SocialProfileInput {
  platform: "instagram" | "tiktok" | "youtube" | "x";
  handle: string;
  postingCadence?: string;
}

export interface InterestInput {
  label: string;
  color?: string;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface StepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
}

export const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Welcome & Basic Info",
    description: "Tell us about yourself",
  },
  {
    id: 2,
    title: "Social Media Profiles",
    description: "Connect your social accounts",
  },
  {
    id: 3,
    title: "About You",
    description: "Share your interests",
  },
  {
    id: 4,
    title: "Profile Photo",
    description: "Upload your photo",
  },
  {
    id: 5,
    title: "Review & Complete",
    description: "Review your information",
  },
];
