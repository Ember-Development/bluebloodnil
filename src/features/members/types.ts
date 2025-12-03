export interface MemberListItem {
  id: string
  name: string
  type: 'brand' | 'facility' | 'sponsor' | 'partner'
  logoUrl: string
  location?: string
  description: string
  campaignsCount: number
  athletesWorkedWith: number
  specialties: string[]
  websiteUrl?: string
  contactEmail?: string
}

export const MOCK_MEMBERS: MemberListItem[] = [
  {
    id: '1',
    name: 'Houston Training Lab',
    type: 'facility',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Houston, TX',
    description:
      'Premier indoor training facility specializing in softball development, strength & conditioning, and youth camps.',
    campaignsCount: 8,
    athletesWorkedWith: 12,
    specialties: ['Training Facilities', 'Youth Camps', 'Strength & Conditioning'],
    websiteUrl: 'https://example.com',
    contactEmail: 'info@htxlab.example',
  },
  {
    id: '2',
    name: 'Lone Star Grill',
    type: 'sponsor',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Houston, TX',
    description:
      'Family-friendly restaurant chain supporting local athletes and tournament teams across Texas.',
    campaignsCount: 5,
    athletesWorkedWith: 8,
    specialties: ['Restaurants', 'Family Dining', 'Tournament Sponsorships'],
    websiteUrl: 'https://example.com',
  },
  {
    id: '3',
    name: 'Texas Elite Gear',
    type: 'brand',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Dallas, TX',
    description:
      'Performance apparel and equipment brand focused on select softball athletes and teams.',
    campaignsCount: 12,
    athletesWorkedWith: 18,
    specialties: ['Apparel', 'Equipment', 'Product Launches'],
    websiteUrl: 'https://example.com',
    contactEmail: 'partnerships@texaselite.example',
  },
  {
    id: '4',
    name: 'Velocity Sports Performance',
    type: 'facility',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Austin, TX',
    description:
      'Sports performance center offering speed, agility, and power training for competitive athletes.',
    campaignsCount: 6,
    athletesWorkedWith: 10,
    specialties: ['Performance Training', 'Speed & Agility', 'Private Coaching'],
    websiteUrl: 'https://example.com',
  },
  {
    id: '5',
    name: 'BlueBloods Select',
    type: 'partner',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Texas',
    description:
      'Official NIL partner organization managing athlete partnerships, compliance, and brand relationships.',
    campaignsCount: 25,
    athletesWorkedWith: 35,
    specialties: ['NIL Management', 'Compliance', 'Brand Partnerships'],
    websiteUrl: 'https://example.com',
    contactEmail: 'nil@bluebloods.example',
  },
  {
    id: '6',
    name: 'Gulf Coast Nutrition',
    type: 'brand',
    logoUrl: 'https://placehold.co/120x120',
    location: 'Corpus Christi, TX',
    description:
      'Sports nutrition supplements and meal planning services for student-athletes and active families.',
    campaignsCount: 4,
    athletesWorkedWith: 7,
    specialties: ['Nutrition', 'Supplements', 'Meal Planning'],
    websiteUrl: 'https://example.com',
  },
]

