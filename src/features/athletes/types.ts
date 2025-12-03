export interface AthleteListItem {
  id: string
  name: string
  position: string
  team: string
  sport: string
  gradYear: number
  location: string
  avatarUrl: string
  nilScore?: number
  totalReach?: number
  avgEngagement?: number
  campaignsCount: number
  quickTags: string[]
  profileUrl: string
}

export const MOCK_ATHLETES: AthleteListItem[] = [
  {
    id: '1',
    name: 'Anabella Abdullah',
    position: 'SS / 2B',
    team: 'Texas Bombers Gold 18U',
    sport: 'Softball',
    gradYear: 2027,
    location: 'Houston, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
    nilScore: 86,
    totalReach: 18400,
    avgEngagement: 7.8,
    campaignsCount: 3,
    quickTags: ['Middle Infielder', 'Power & Speed', 'Faith & Family'],
    profileUrl: '/athletes/1',
  },
  {
    id: '2',
    name: 'Mia Rodriguez',
    position: 'OF',
    team: 'Texas Bombers 16U',
    sport: 'Softball',
    gradYear: 2028,
    location: 'Dallas, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1607779097040-26f1963a0f11?auto=format&fit=crop&q=80&w=400',
    nilScore: 78,
    totalReach: 12200,
    avgEngagement: 6.5,
    campaignsCount: 1,
    quickTags: ['Outfielder', 'Speed', 'Leadership'],
    profileUrl: '/athletes/2',
  },
  {
    id: '3',
    name: 'Jordan Martinez',
    position: 'P / 1B',
    team: 'Texas Bombers Gold 18U',
    sport: 'Softball',
    gradYear: 2027,
    location: 'San Antonio, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400',
    nilScore: 72,
    totalReach: 8900,
    avgEngagement: 5.9,
    campaignsCount: 2,
    quickTags: ['Pitcher', 'Power Hitter', 'Community'],
    profileUrl: '/athletes/3',
  },
  {
    id: '4',
    name: 'Taylor Chen',
    position: 'C / 3B',
    team: 'Texas Bombers 16U',
    sport: 'Softball',
    gradYear: 2028,
    location: 'Austin, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1594736797933-d0cbc0b0c0e1?auto=format&fit=crop&q=80&w=400',
    nilScore: 68,
    totalReach: 6700,
    avgEngagement: 6.2,
    campaignsCount: 0,
    quickTags: ['Catcher', 'Defense', 'Academics'],
    profileUrl: '/athletes/4',
  },
  {
    id: '5',
    name: 'Alexis Washington',
    position: 'OF / UT',
    team: 'Texas Bombers Gold 18U',
    sport: 'Softball',
    gradYear: 2027,
    location: 'Houston, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400',
    nilScore: 81,
    totalReach: 15200,
    avgEngagement: 8.1,
    campaignsCount: 4,
    quickTags: ['Versatile', 'Content Creator', 'Fitness'],
    profileUrl: '/athletes/5',
  },
  {
    id: '6',
    name: 'Sofia Garcia',
    position: '2B / SS',
    team: 'Texas Bombers 16U',
    sport: 'Softball',
    gradYear: 2029,
    location: 'Corpus Christi, TX',
    avatarUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400',
    nilScore: 65,
    totalReach: 5400,
    avgEngagement: 5.4,
    campaignsCount: 0,
    quickTags: ['Middle Infielder', 'Youth Leader', 'Faith'],
    profileUrl: '/athletes/6',
  },
]

