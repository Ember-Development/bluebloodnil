import type { AthleteListItem } from "../athletes/types";

export interface AdminMetrics {
  totalAthletes: number;
  activeCampaigns: number;
  totalEarnings: number;
  pendingTodos: number;
  totalBrands: number;
  avgEngagement: number;
  recentActivity: {
    label: string;
    value: string;
    timeAgo: string;
  }[];
}

export interface AdminAthlete extends AthleteListItem {
  email?: string;
  status: "active" | "inactive" | "pending";
  lastActive?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  tier?: string;
  category?: string;
  contactEmail?: string;
  contactName?: string;
  campaignsCount: number;
  createdAt: string;
  status: "active" | "inactive";
}

export interface AdminTodo {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // athlete ID
  assignedToName: string;
  assignedBy: string; // admin name
  assignedDate: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  campaignId?: string;
}

export type CampaignType =
  | "SOCIAL_MEDIA_POST"
  | "COMMERCIAL_VIDEO"
  | "IN_PERSON_APPEARANCE"
  | "PRODUCT_ENDORSEMENT"
  | "AUTOGRAPH_SIGNING"
  | "SPEAKING_ENGAGEMENT"
  | "PHOTO_SHOOT"
  | "PARTNERSHIP";

export type EarningsSplitMethod = "EQUAL" | "CUSTOM";

export interface Campaign {
  id: string;
  title: string;
  description?: string | null;
  type: CampaignType;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isOpen: boolean;
  address?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalEarnings?: number | null;
  earningsSplitMethod: EarningsSplitMethod;
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  participants: Array<{
    id: string;
    athlete: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
    status: string;
    earnings?: number | null;
    appliedAt?: string | null;
  }>;
  createdAt: string;
}

export interface FeedPostForm {
  type: "athlete_update" | "campaign" | "org_announcement" | "commitment";
  headline: string;
  body: string;
  tags: string[];
  authorId?: string; // for athlete_update
  authorName?: string;
  authorRole?: string;
  authorAvatarUrl?: string;
  mediaUrl?: string;
  statLine?: string; // for athlete_update
  brand?: string; // for campaign
  brandLogoUrl?: string;
  objective?: string; // for campaign
  program?: string; // for commitment
  level?: "D1" | "D2" | "NAIA" | "JUCO" | "HS" | "Club";
}

export interface NotificationForm {
  title: string;
  message: string;
  targetAudience: "all" | "athletes" | "brands" | "specific";
  targetIds?: string[]; // for specific audience
  priority: "low" | "medium" | "high";
  scheduledFor?: string; // optional scheduling
}
