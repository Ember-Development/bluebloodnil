export interface Interest {
  id: string;
  label: string;
  icon?: string; // Placeholder for icon name or component
  color?: string; // For the dot
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export interface Insight {
  id: string;
  author: string;
  authorLogo: string;
  content: string;
  timeAgo: string;
  imageUrl?: string;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x';

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  followers: number;
  avgEngagementRate: number; // percentage, e.g. 5.2
  avgViews: number;
  postingCadence: string;
}

export interface AudienceStat {
  label: string;
  value: string;
}

export interface AudienceBreakdown {
  // Detailed analytics data (optional - requires social media analytics)
  ageBands?: AudienceStat[];
  locations?: AudienceStat[];
  interests?: AudienceStat[];
  
  // Simple format (easier to populate - no analytics required)
  primaryMarkets?: string[]; // Simple list of market areas (e.g., ["Houston, TX", "Dallas, TX"])
  targetAudience?: string; // Simple description (e.g., "Youth athletes and parents")
  
  // Note: Use either detailed format OR simple format. If detailed data exists, it will be shown.
  // If only simple data exists, that will be displayed instead.
}

export type MetricEmphasis = 'reach' | 'engagement' | 'conversion';

export interface NILMetricTile {
  id: string;
  label: string;
  value: string;
  helper?: string;
  emphasis?: MetricEmphasis;
}

export interface CredibilityBadge {
  id: string;
  label: string;
  description?: string;
  category: 'org' | 'tournament' | 'award' | 'compliance';
}

export interface ScenarioIdea {
  id: string;
  title: string;
  goal: string;
  description: string;
  idealBrands: string;
}

export interface CampaignSummary {
  id: string;
  brand: string;
  brandLogoUrl: string;
  title: string;
  objective: string;
  deliverables: string[];
  outcomes: string[];
  quote?: string;
}

export interface ContactChannel {
  type: 'org' | 'parent' | 'agent';
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export type CampaignStatus = 'active' | 'completed' | 'pending' | 'cancelled';

export interface CampaignWithEarnings {
  id: string;
  brand: string;
  brandLogoUrl: string;
  title: string;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  earnings: number; // in dollars
  paid: boolean;
  deliverables: string[];
  notes?: string;
}

export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface AthleteTodo {
  verificationType?: 'SOCIAL_POST' | 'IN_PERSON_EVENT' | 'COMMERCIAL_VIDEO' | 'OTHER' | null;
  verificationUrl?: string | null;
  verificationNotes?: string | null;
  verifiedAt?: string | null;
  id: string;
  title: string;
  description: string;
  assignedBy: string; // admin name
  assignedDate: string;
  dueDate: string;
  status: TodoStatus;
  campaignId?: string; // optional link to a campaign
  priority: 'low' | 'medium' | 'high';
}

export interface BrandContentItem {
  id: string;
  type: 'image' | 'video' | 'post';
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  brandName?: string;
  brandLogoUrl?: string;
  campaignTitle?: string;
}

export interface AthleteProfileData {
  id: string;
  name: string;
  role: string;
  team: string;
  sport: string;
  primaryPosition: string;
  throwsBats?: string;
  gradYear: number;
  location: string;
  avatarUrl: string;
  coverUrl?: string; // If we had a cover image
  supportersCount: number;
  campaignsCount: number;
  nilScore?: number;
  eligibilityNote: string;
  quickTags: string[];
  bio: string;
  brandFitSummary: string;
  interests: Interest[];
  milestones: Milestone[];
  insights: Insight[];
  media: {
    type: 'video' | 'image';
    url: string;
    thumbnailUrl: string;
  };
  credibilityBadges: CredibilityBadge[];
  nilMetrics: NILMetricTile[];
  socialProfiles: SocialProfile[];
  audience: AudienceBreakdown;
  scenarioIdeas: ScenarioIdea[];
  campaigns: CampaignSummary[];
  contactChannels: ContactChannel[];
  campaignsWithEarnings: CampaignWithEarnings[];
  todos: AthleteTodo[];
  totalEarnings: number;
  brandContent: BrandContentItem[];
  feedPosts: import('../feed/types').FeedItem[];
}

export const MOCK_PROFILE: AthleteProfileData = {
  id: '1',
  name: 'Anabella Abdullah',
  role: 'Shortstop',
  team: 'Texas Bombers Gold 18U',
  sport: 'Softball',
  primaryPosition: 'SS / 2B',
  throwsBats: 'R / R',
  gradYear: 2027,
  location: 'Houston, TX',
  avatarUrl:
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
  supportersCount: 120,
  campaignsCount: 3,
  nilScore: 86,
  eligibilityNote: 'Texas HS NIL eligible · Select softball',
  quickTags: ['Middle Infielder', 'Power & Speed', 'Faith & Family', 'Community Camps'],
  bio: `I’m Anabella, a 2027 middle infielder with Texas Bombers Gold 18U. When I’m not turning
double plays, I’m running youth skills sessions, creating game-day breakdowns, and sharing what
it really looks like to chase big goals as a student-athlete. Families and younger athletes follow
along for drills, mindset tips, and behind-the-scenes from tournaments across Texas.`,
  brandFitSummary:
    'Perfect fit for softball brands, local training facilities, family-focused restaurants, faith-based orgs, and community partners who want a positive female athlete leading the story.',
  interests: [
    { id: '1', label: 'Photography', color: '#d4a373' },
    { id: '2', label: 'Strength Training', color: '#e9c46a' },
    { id: '3', label: 'Travel Ball Tournaments', color: '#2a9d8f' },
    { id: '4', label: 'Content Creation', color: '#e76f51' },
    { id: '5', label: 'Gaming', color: '#264653' },
    { id: '6', label: 'Faith & Family Time', color: '#f4a261' },
  ],
  milestones: [],
  media: {
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
  },
  insights: [
    {
      id: '1',
      author: 'Texas Bombers Softball',
      authorLogo: 'https://placehold.co/40x40',
      content:
        'Anabella led our Gold 18U squad to a championship berth in Dallas this weekend, hitting .429 with 3 extra-base hits and making multiple web-gem plays at short.',
      timeAgo: '2 days ago',
    },
    {
      id: '2',
      author: 'Houston Training Lab',
      authorLogo: 'https://placehold.co/40x40',
      content:
        'Huge turnout for our youth infield clinic with Anabella — over 60 athletes and families from around Houston. Her energy, instruction, and relatability kept kids locked in start to finish.',
      timeAgo: '1 week ago',
      imageUrl:
        'https://images.unsplash.com/photo-1628779238951-bd1c9796be68?auto=format&fit=crop&q=80&w=800',
    },
  ],
  credibilityBadges: [
    {
      id: 'org',
      label: 'Texas Bombers Gold Select',
      description: 'Nationally recognized select softball organization',
      category: 'org',
    },
    {
      id: 'pgf',
      label: 'PGF / Alliance Circuit',
      description: 'Competes in top national events and showcases',
      category: 'tournament',
    },
    {
      id: 'captain',
      label: 'Team Captain',
      description: 'Leads infield and culture for 18U roster',
      category: 'award',
    },
    {
      id: 'tx-nil',
      label: 'Texas HS NIL Eligible',
      description: 'Compliant NIL participation for select softball',
      category: 'compliance',
    },
  ],
  nilMetrics: [
    {
      id: 'reach',
      label: 'Total Social Reach',
      value: '18.4K',
      helper: 'Combined followers across IG & TikTok',
      emphasis: 'reach',
    },
    {
      id: 'engagement',
      label: 'Avg Engagement',
      value: '7.8%',
      helper: 'Last 60 days, across game-day posts',
      emphasis: 'engagement',
    },
    {
      id: 'views',
      label: 'Typical Video Views',
      value: '4.2K',
      helper: 'Median Reels/TikToks per post',
      emphasis: 'reach',
    },
    {
      id: 'local',
      label: 'Texas / Gulf Coast',
      value: '63%',
      helper: 'Followers in TX / LA / OK',
      emphasis: 'conversion',
    },
  ],
  socialProfiles: [
    {
      platform: 'instagram',
      handle: '@anabella.abdullah',
      followers: 10500,
      avgEngagementRate: 7.4,
      avgViews: 3900,
      postingCadence: '4–5 posts + 8–10 stories / week',
    },
    {
      platform: 'tiktok',
      handle: '@anabellaballin',
      followers: 6200,
      avgEngagementRate: 8.3,
      avgViews: 4600,
      postingCadence: '3–4 videos / week',
    },
    {
      platform: 'youtube',
      handle: 'Anabella Abdullah',
      followers: 750,
      avgEngagementRate: 6.1,
      avgViews: 1200,
      postingCadence: 'Weekly game recap / vlog',
    },
  ],
  audience: {
    ageBands: [
      { label: '13–17 athletes', value: '38%' },
      { label: '18–24 athletes', value: '22%' },
      { label: 'Parents of athletes', value: '30%' },
    ],
    locations: [
      { label: 'Houston metro', value: '32%' },
      { label: 'DFW / North TX', value: '18%' },
      { label: 'San Antonio / Austin', value: '11%' },
      { label: 'Gulf Coast & South', value: '10%' },
    ],
    interests: [
      { label: 'Softball & youth sports', value: '72%' },
      { label: 'Training / strength', value: '54%' },
      { label: 'Faith & inspiration', value: '41%' },
      { label: 'Food & local spots', value: '33%' },
    ],
  },
  scenarioIdeas: [
    {
      id: 'gear',
      title: 'Launch a new bat or glove line',
      goal: 'Product awareness & try-ons across Texas tournaments',
      description:
        'Game-day content using your gear, infield drill breakdowns featuring key tech, and Q&A on why she trusts your brand.',
      idealBrands: 'Bat & glove brands, performance apparel, cleat companies.',
    },
    {
      id: 'training',
      title: 'Drive traffic to local training facility',
      goal: 'Camp sign-ups and recurring memberships',
      description:
        'Co-branded clinics, behind-the-scenes training content, and referral codes for her followers and Bombers network.',
      idealBrands: 'Indoor facilities, trainers, strength & conditioning providers.',
    },
    {
      id: 'restaurant',
      title: 'Highlight family-first local spots',
      goal: 'Post-practice/tournament visits and family traffic',
      description:
        'Team meals, “day in the life” content featuring your restaurant, and tournament weekend offers to her audience.',
      idealBrands: 'Family restaurants, smoothie/coffee shops, local retailers.',
    },
  ],
  campaigns: [
    {
      id: 'htx-training-lab',
      brand: 'Houston Training Lab',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Youth Infield Skills Clinic',
      objective: 'Fill 50+ camp spots with local athletes',
      deliverables: [
        '3 Instagram Reels + 1 TikTok announcing and recapping the clinic',
        'In-person appearance and demo session',
      ],
      outcomes: [
        '62 athletes registered (24 above goal)',
        '32% of sign-ups used Anabella’s referral code',
        'Reels reached 18.2K accounts with 9.1% engagement',
      ],
      quote:
        'Parents trusted the clinic immediately because they already follow Anabella — we sold out faster than any previous camp.',
    },
    {
      id: 'lone-star-grill',
      brand: 'Lone Star Grill',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Tournament Weekend Feature',
      objective: 'Drive team & family traffic during a major Houston tournament',
      deliverables: [
        'Story series and post featuring team meal',
        'Discount code for Bombers families and followers',
      ],
      outcomes: [
        '120+ redemptions of NIL code over 3 days',
        'Restaurant reported best tournament weekend in 12 months',
      ],
    },
  ],
  contactChannels: [
    {
      type: 'org',
      name: 'BlueBlood NIL Desk',
      role: 'Org NIL & partnerships',
      email: 'nil@bluebloods.example',
      notes: 'Primary contact for brands and agencies.',
    },
    {
      type: 'parent',
      name: 'Sara Abdullah',
      role: 'Parent/guardian',
      notes: 'Reviews all offers and final content.',
    },
  ],
  campaignsWithEarnings: [
    {
      id: 'htx-training-lab',
      brand: 'Houston Training Lab',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Youth Infield Skills Clinic',
      startDate: '2024-01-15',
      endDate: '2024-02-20',
      status: 'completed',
      earnings: 2500,
      paid: true,
      deliverables: [
        '3 Instagram Reels + 1 TikTok announcing and recapping the clinic',
        'In-person appearance and demo session',
      ],
      notes: 'Campaign completed successfully with 62 athlete registrations.',
    },
    {
      id: 'lone-star-grill',
      brand: 'Lone Star Grill',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Tournament Weekend Feature',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      status: 'completed',
      earnings: 1200,
      paid: true,
      deliverables: [
        'Story series and post featuring team meal',
        'Discount code for Bombers families and followers',
      ],
    },
    {
      id: 'gear-brand-q2',
      brand: 'Elite Softball Gear',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Spring Product Launch',
      startDate: '2024-04-01',
      endDate: '2024-05-31',
      status: 'active',
      earnings: 3500,
      paid: false,
      deliverables: [
        '5 Instagram posts featuring new bat line',
        '3 TikTok videos with product demonstrations',
        '1 YouTube unboxing video',
      ],
      notes: 'Campaign in progress. First payment due upon completion.',
    },
    {
      id: 'local-restaurant',
      brand: 'Texas BBQ House',
      brandLogoUrl: 'https://placehold.co/64x64',
      title: 'Summer Promotion',
      startDate: '2024-06-01',
      status: 'pending',
      earnings: 800,
      paid: false,
      deliverables: [
        '2 Instagram posts',
        '1 TikTok video',
      ],
    },
  ],
  todos: [
    {
      id: 'todo-1',
      title: 'Submit content for Elite Softball Gear campaign',
      description: 'Upload the 3 TikTok videos and 2 Instagram posts for review. Ensure all content follows brand guidelines.',
      assignedBy: 'Admin Sarah',
      assignedDate: '2024-04-15',
      dueDate: '2024-04-25',
      status: 'in_progress',
      campaignId: 'gear-brand-q2',
      priority: 'high',
    },
    {
      id: 'todo-2',
      title: 'Complete media kit update',
      description: 'Update your media kit with latest social media statistics and recent campaign results.',
      assignedBy: 'Admin Sarah',
      assignedDate: '2024-04-10',
      dueDate: '2024-04-30',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 'todo-3',
      title: 'Review and sign Texas BBQ House contract',
      description: 'Review the contract terms for the summer promotion campaign and sign if approved.',
      assignedBy: 'Admin Mike',
      assignedDate: '2024-04-18',
      dueDate: '2024-04-22',
      status: 'pending',
      campaignId: 'local-restaurant',
      priority: 'high',
    },
    {
      id: 'todo-4',
      title: 'Submit expense report for Houston Training Lab',
      description: 'Submit receipts for travel and materials used during the clinic campaign.',
      assignedBy: 'Admin Sarah',
      assignedDate: '2024-02-25',
      dueDate: '2024-03-05',
      status: 'completed',
      campaignId: 'htx-training-lab',
      priority: 'low',
    },
  ],
  totalEarnings: 8000,
};

