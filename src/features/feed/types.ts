export type FeedItemType = 'athlete_update' | 'campaign' | 'org_announcement' | 'commitment'

export interface FeedAuthor {
  id: string
  name: string
  role: string
  avatarUrl: string
  org?: string
}

export interface FeedItemBase {
  id: string
  type: FeedItemType
  createdAt: string
  timeAgo: string
  author: FeedAuthor
  headline: string
  body: string
  tags: string[]
}

export interface AthleteUpdateItem extends FeedItemBase {
  type: 'athlete_update'
  statLine?: string
  mediaUrl?: string
}

export interface CampaignItem extends FeedItemBase {
  type: 'campaign'
  brand: string
  brandLogoUrl: string
  objective: string
  status: 'planning' | 'live' | 'wrapped'
  campaignId?: string
  isOpen?: boolean
}

export interface OrgAnnouncementItem extends FeedItemBase {
  type: 'org_announcement'
}

export interface CommitmentItem extends FeedItemBase {
  type: 'commitment'
  program: string
  level: 'D1' | 'D2' | 'NAIA' | 'JUCO' | 'HS' | 'Club'
}

export type FeedItem =
  | AthleteUpdateItem
  | CampaignItem
  | OrgAnnouncementItem
  | CommitmentItem

export interface TrendingAthlete {
  id: string
  name: string
  position: string
  team: string
  avatarUrl: string
  recentActivity: string
  nilScore?: number
  profileUrl: string
}

export interface FeaturedCampaign {
  id: string
  brand: string
  brandLogoUrl: string
  title: string
  objective: string
  status: 'planning' | 'live' | 'wrapped'
  metrics: {
    impressions?: string
    engagement?: string
    conversions?: string
  }
  athleteName: string
}

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    type: 'athlete_update',
    createdAt: '2025-11-29T14:20:00Z',
    timeAgo: '12m ago',
    author: {
      id: 'athlete-1',
      name: 'Anabella Abdullah',
      role: 'SS / 2B · Texas Bombers Gold 18U',
      avatarUrl:
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
      org: 'Texas Bombers',
    },
    headline: '3-for-3 with a bomb and a web-gem at short in Dallas showcase',
    body: 'Anabella capped off pool play going 3-for-3 with a HR, 2B and a diving backhand in the 6-hole that saved two runs. IG and TikTok recaps dropping tonight.',
    tags: ['Game Highlight', 'Dallas Showcase', '18U Gold'],
    statLine: '3-3, HR, 2B, 3 RBI, 2 R',
    mediaUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=900',
  },
  {
    id: '2',
    type: 'campaign',
    createdAt: '2025-11-28T21:05:00Z',
    timeAgo: '1 day ago',
    author: {
      id: 'brand-1',
      name: 'Houston Training Lab',
      role: 'Partner Facility',
      avatarUrl: 'https://placehold.co/64x64',
      org: 'Houston, TX',
    },
    headline: 'Youth infield clinic with Anabella — 60+ athletes locked in',
    body: 'Session one of our co-branded youth infield clinic sold out in under 48 hours. Session two opens Monday with limited spots and Bombers-only discount codes.',
    tags: ['Campaign', 'Clinic', 'Houston'],
    brand: 'Houston Training Lab',
    brandLogoUrl: 'https://placehold.co/56x56',
    objective: 'Drive youth camp sign-ups and recurring memberships',
    status: 'wrapped',
  },
  {
    id: '3',
    type: 'org_announcement',
    createdAt: '2025-11-27T17:30:00Z',
    timeAgo: '2 days ago',
    author: {
      id: 'org-1',
      name: 'BlueBloods NIL Desk',
      role: 'Org NIL & Partnerships',
      avatarUrl: 'https://placehold.co/64x64',
      org: 'BlueBloods Select',
    },
    headline: 'Texas HS NIL compliance webinar for families & brands',
    body: 'Join our NIL desk and partner attorneys for a live breakdown of Texas HS NIL rules, what’s allowed for select softball, and how we protect athletes + brands.',
    tags: ['Compliance', 'Education', 'Webinar'],
  },
  {
    id: '4',
    type: 'commitment',
    createdAt: '2025-11-20T12:00:00Z',
    timeAgo: '1 week ago',
    author: {
      id: 'athlete-2',
      name: 'Mia Rodriguez',
      role: 'OF · Texas Bombers 16U',
      avatarUrl:
        'https://images.unsplash.com/photo-1607779097040-26f1963a0f11?auto=format&fit=crop&q=80&w=400',
      org: 'Texas Bombers',
    },
    headline: 'Committed to Oklahoma State to continue her academic & softball journey',
    body: 'Mia has officially committed to Oklahoma State. Huge congrats to her family and the Bombers org — more details on her story and future plans coming soon.',
    tags: ['Commitment', 'Recruiting'],
    program: 'Oklahoma State',
    level: 'D1',
  },
]

export const MOCK_TRENDING_ATHLETES: TrendingAthlete[] = [
  {
    id: '1',
    name: 'Anabella Abdullah',
    position: 'SS / 2B',
    team: '18U Gold',
    avatarUrl:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
    recentActivity: '3-for-3, HR in Dallas showcase',
    nilScore: 86,
    profileUrl: '/athletes/1',
  },
  {
    id: '2',
    name: 'Mia Rodriguez',
    position: 'OF',
    team: '16U',
    avatarUrl:
      'https://images.unsplash.com/photo-1607779097040-26f1963a0f11?auto=format&fit=crop&q=80&w=400',
    recentActivity: 'Committed to Oklahoma State',
    nilScore: 78,
    profileUrl: '/athletes/2',
  },
]

export const MOCK_FEATURED_CAMPAIGN: FeaturedCampaign = {
  id: 'featured-1',
  brand: 'Houston Training Lab',
  brandLogoUrl: 'https://placehold.co/64x64',
  title: 'Youth Infield Skills Clinic',
  objective: 'Drive camp sign-ups and facility memberships',
  status: 'wrapped',
  metrics: {
    impressions: '18.2K',
    engagement: '9.1%',
    conversions: '62 sign-ups',
  },
  athleteName: 'Anabella Abdullah',
}
