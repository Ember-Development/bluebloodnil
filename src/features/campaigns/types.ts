export interface AvailableCampaign {
  id: string;
  title: string;
  description?: string | null;
  type: 'SOCIAL_MEDIA_POST' | 'COMMERCIAL_VIDEO' | 'IN_PERSON_APPEARANCE' | 'PRODUCT_ENDORSEMENT' | 'AUTOGRAPH_SIGNING' | 'SPEAKING_ENGAGEMENT' | 'PHOTO_SHOOT' | 'PARTNERSHIP';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  isOpen: boolean;
  address?: string | null;
  totalEarnings?: number | null;
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  participants: Array<{
    id: string;
    status: string;
  }>;
  createdAt: string;
}

