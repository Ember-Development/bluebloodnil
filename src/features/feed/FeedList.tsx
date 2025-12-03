import type { FeedItem } from './types'
import { FeedCard } from './FeedCard'
import { FeedRail } from './FeedRail'

interface FeedListProps {
  items: FeedItem[]
  activeFilter: string
}

export function FeedList({ items, activeFilter }: FeedListProps) {
  const filtered = items.filter((item) => {
    switch (activeFilter) {
      case 'Athletes':
        return item.type === 'athlete_update' || item.type === 'commitment'
      case 'Campaigns':
        return item.type === 'campaign'
      case 'Org':
        return item.type === 'org_announcement'
      default:
        return true
    }
  })

  return (
    <div className="feed-list">
      <div className="feed-column">
        {filtered.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
      <FeedRail />
    </div>
  )
}

