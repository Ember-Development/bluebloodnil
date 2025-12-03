interface FeedHeaderProps {
  activeFilter: string
  onFilterChange: (value: string) => void
}

const FILTERS = ['All', 'Athletes', 'Campaigns', 'Org']

export function FeedHeader({ activeFilter, onFilterChange }: FeedHeaderProps) {
  return (
    <header className="feed-header">
      <div>
        <h1 className="feed-title">Feed</h1>
        <p className="feed-subtitle">
          Real-time updates from athletes, campaigns, and the BlueBloods NIL desk.
        </p>
      </div>
      <div className="feed-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`feed-filter-pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </header>
  )
}

