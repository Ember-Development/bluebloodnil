export const formatTag = (tag: string) => `#${tag.replace(/\s+/g, '').toLowerCase()}`

export const getItemAccentClass = (type: string): string => {
  switch (type) {
    case 'athlete_update':
      return 'feed-card-athlete'
    case 'campaign':
      return 'feed-card-campaign'
    case 'org_announcement':
      return 'feed-card-org'
    case 'commitment':
      return 'feed-card-commitment'
    default:
      return ''
  }
}
