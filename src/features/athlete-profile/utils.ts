import type { AthleteProfileData, BrandContentItem } from './types';
import type { FeedItem } from '../feed/types';

interface AthleteFromDB {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  position1?: string | null;
  position2?: string | null;
  school?: string | null;
  teamName?: string | null;
  jerseyNumber?: number | null;
  classYear?: number | null;
  gradYear?: number | null;
  ageGroup?: string | null;
  address?: string | null;
  location?: string | null;
  bio?: string | null;
  sport?: string | null;
  primaryPosition?: string | null;
  avatarUrl?: string | null;
  nilScore?: number | null;
  brandFitSummary?: string | null;
  socialProfiles?: Array<{
    id: string;
    platform: string;
    handle: string;
    followers: number;
    avgEngagementRate?: number | null;
    avgViews?: number | null;
    postingCadence?: string | null;
  }>;
  interests?: Array<{
    id: string;
    label: string;
    color?: string | null;
  }>;
  scenarioIdeas?: Array<{
    id: string;
    title: string;
    goal: string;
    description: string;
    idealBrands: string;
  }>;
  participants?: Array<{
    id: string;
    earnings?: number | null;
    status?: string;
    campaign: {
      id: string;
      title: string;
      description?: string | null;
      status?: string;
      createdAt?: string | Date;
      organization: {
        id: string;
        name: string;
        logoUrl?: string | null;
      };
    };
  }>;
  contents?: Array<{
    id: string;
    type: string;
    mediaUrl: string;
    caption?: string | null;
    createdAt: string | Date;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    date: string | Date;
    description?: string | null;
  }>;
  todos?: Array<{
    id: string;
    title: string;
    description: string;
    assignedBy: string;
    dueDate: string | Date;
    status: string;
    campaignId?: string | null;
    priority: string;
    verificationType?: string | null;
    verificationUrl?: string | null;
    verificationNotes?: string | null;
    verifiedAt?: string | Date | null;
    createdAt: string | Date;
  }>;
  parentContacts?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    relationship?: string | null;
  }>;
}

export function transformAthleteProfile(athlete: AthleteFromDB, feedPosts: FeedItem[] = []): AthleteProfileData {
  // Calculate total reach from social profiles
  const totalReach = athlete.socialProfiles?.reduce((sum, profile) => sum + (profile.followers || 0), 0) || 0;

  // Calculate average engagement
  const engagementRates = athlete.socialProfiles
    ?.map((p) => p.avgEngagementRate)
    .filter((rate): rate is number => rate !== null && rate !== undefined) || [];
  const avgEngagement = engagementRates.length > 0
    ? engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length
    : undefined;

  // Build position string
  const position = athlete.position || 
    [athlete.position1, athlete.position2].filter(Boolean).join(' / ') ||
    athlete.primaryPosition ||
    'Athlete';

  // Transform social profiles
  const socialProfiles = (athlete.socialProfiles || []).map((sp) => ({
    platform: sp.platform as 'instagram' | 'tiktok' | 'youtube' | 'x',
    handle: sp.handle,
    followers: sp.followers || 0,
    avgEngagementRate: sp.avgEngagementRate ?? 0,
    avgViews: sp.avgViews || 0,
    postingCadence: sp.postingCadence || '',
  }));

  // Transform interests
  const interests = (athlete.interests || []).map((i) => ({
    id: i.id,
    label: i.label,
    color: i.color || undefined,
  }));

  // Transform scenario ideas
  const scenarioIdeas = (athlete.scenarioIdeas || []).map((si) => ({
    id: si.id,
    title: si.title,
    goal: si.goal,
    description: si.description,
    idealBrands: si.idealBrands,
  }));

  // Transform campaigns
  const campaigns = (athlete.participants || [])
    .filter((p) => p.campaign)
    .map((p) => ({
      id: p.campaign.id,
      brand: p.campaign.organization.name,
      brandLogoUrl: p.campaign.organization.logoUrl || 'https://placehold.co/64x64',
      title: p.campaign.title,
      objective: p.campaign.description || '',
      deliverables: [],
      outcomes: [],
    }));

  // Transform brand content
  const brandContent: BrandContentItem[] = (athlete.contents || [])
    .map((content) => {
      // Try to find associated campaign for brand info
      const associatedCampaign = campaigns.find((c) => 
        content.caption?.toLowerCase().includes(c.brand.toLowerCase()) ||
        content.caption?.toLowerCase().includes(c.title.toLowerCase())
      );

      return {
        id: content.id,
        type: (content.type === 'video' ? 'video' : 'image') as 'image' | 'video' | 'post',
        mediaUrl: content.mediaUrl,
        caption: content.caption || undefined,
        createdAt: typeof content.createdAt === 'string' 
          ? content.createdAt 
          : content.createdAt.toISOString(),
        brandName: associatedCampaign?.brand,
        brandLogoUrl: associatedCampaign?.brandLogoUrl,
        campaignTitle: associatedCampaign?.title,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Use feed posts passed as parameter (fetched from API)

  // Get first content as media (if available)
  const firstContent = athlete.contents?.[0];
  const media = firstContent ? {
    type: firstContent.type as 'video' | 'image',
    url: firstContent.mediaUrl,
    thumbnailUrl: firstContent.mediaUrl,
  } : {
    type: 'image' as const,
    url: athlete.avatarUrl || 'https://via.placeholder.com/800x450?text=No+Media',
    thumbnailUrl: athlete.avatarUrl || 'https://via.placeholder.com/800x450?text=No+Media',
  };

  // Build quick tags from interests and positions
  const quickTags = [
    ...(interests.slice(0, 2).map((i) => i.label)),
    ...(athlete.position1 ? [athlete.position1] : []),
  ].slice(0, 4);

  return {
    id: athlete.id,
    name: athlete.name,
    role: position,
    team: athlete.teamName || 'No Team',
    sport: athlete.sport || 'Athletics',
    primaryPosition: athlete.primaryPosition || athlete.position1 || position,
    gradYear: athlete.gradYear || athlete.classYear || new Date().getFullYear(),
    location: athlete.location || athlete.address || 'Location TBD',
    avatarUrl: athlete.avatarUrl || 'https://via.placeholder.com/400x400?text=No+Photo',
    nilScore: athlete.nilScore || undefined,
    supportersCount: 0, // TODO: Add supporters tracking
    campaignsCount: campaigns.length,
    eligibilityNote: `${athlete.sport || 'Athletics'} · ${athlete.teamName || 'Team'}`,
    quickTags,
    bio: athlete.bio || 'Bio coming soon...',
    brandFitSummary: athlete.brandFitSummary || 'Brand positioning information coming soon.',
    interests,
    milestones: (athlete.milestones || []).map((m) => ({
      id: m.id,
      title: m.title,
      date: typeof m.date === 'string' ? m.date : m.date.toISOString().split('T')[0],
      description: m.description || undefined,
    })),
    insights: [], // TODO: Add insights feed
    media,
    credibilityBadges: [], // TODO: Add credibility badges
    nilMetrics: [
      totalReach > 0 ? {
        id: 'reach',
        label: 'Total Social Reach',
        value: totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach.toString(),
        helper: 'Combined followers across all platforms',
        emphasis: 'reach' as const,
      } : null,
      avgEngagement ? {
        id: 'engagement',
        label: 'Avg Engagement',
        value: `${avgEngagement.toFixed(1)}%`,
        helper: 'Average engagement rate',
        emphasis: 'engagement' as const,
      } : null,
    ].filter((m): m is NonNullable<typeof m> => m !== null),
    socialProfiles,
    audience: {
      targetAudience: 'Athletes and sports enthusiasts',
      primaryMarkets: athlete.location ? [athlete.location] : [],
    },
    scenarioIdeas,
    campaigns,
    contactChannels: (athlete.parentContacts || []).map((pc) => ({
      type: 'parent' as const,
      name: `${pc.firstName} ${pc.lastName}`,
      role: pc.relationship || 'Parent/Guardian',
      email: pc.email || undefined,
      phone: pc.phone || undefined,
    })),
    campaignsWithEarnings: (athlete.participants || [])
      .filter((p) => p.campaign)
      .map((p) => ({
        id: p.campaign.id,
        title: p.campaign.title,
        brand: p.campaign.organization.name,
        brandLogoUrl: p.campaign.organization.logoUrl || 'https://placehold.co/64x64',
        status: (p.campaign.status === 'ACTIVE' ? 'active' : 
                 p.campaign.status === 'COMPLETED' ? 'completed' : 
                 p.campaign.status === 'ARCHIVED' ? 'cancelled' : 'pending') as 'active' | 'completed' | 'pending' | 'cancelled',
        startDate: p.campaign.createdAt
          ? (typeof p.campaign.createdAt === 'string' 
              ? p.campaign.createdAt 
              : p.campaign.createdAt.toISOString())
          : new Date().toISOString(),
        endDate: undefined, // TODO: Add endDate to campaign model if needed
        earnings: p.earnings || 0, // Use actual earnings from participant
        paid: p.campaign.status === 'COMPLETED', // Consider "paid" as deposited to trust when campaign is completed
        deliverables: [], // TODO: Add deliverables tracking
        notes: p.campaign.description || undefined,
      })),
    todos: (athlete.todos || []).map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      assignedBy: todo.assignedBy,
      assignedDate: todo.createdAt
        ? typeof todo.createdAt === 'string'
          ? todo.createdAt
          : todo.createdAt.toISOString()
        : new Date().toISOString(),
      dueDate: typeof todo.dueDate === 'string' ? todo.dueDate : todo.dueDate.toISOString(),
      status: todo.status as 'pending' | 'in_progress' | 'completed',
      campaignId: todo.campaignId || undefined,
      priority: todo.priority as 'low' | 'medium' | 'high',
      verificationType: (todo.verificationType as 'SOCIAL_POST' | 'IN_PERSON_EVENT' | 'COMMERCIAL_VIDEO' | 'OTHER' | null) || undefined,
      verificationUrl: todo.verificationUrl || undefined,
      verificationNotes: todo.verificationNotes || undefined,
      verifiedAt: todo.verifiedAt
        ? typeof todo.verifiedAt === 'string'
          ? todo.verifiedAt
          : todo.verifiedAt.toISOString()
        : undefined,
    })),
    totalEarnings: (athlete.participants || [])
      .filter((p) => p.campaign && p.earnings)
      .reduce((sum, p) => sum + (p.earnings || 0), 0),
    brandContent,
    feedPosts,
  };
}

