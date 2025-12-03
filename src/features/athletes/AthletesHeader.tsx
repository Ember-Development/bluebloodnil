interface AthletesHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeFilter: string
  onFilterChange: (value: string) => void
}

const FILTERS = ['All', '18U', '16U', '2027', '2028', '2029']

export function AthletesHeader({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: AthletesHeaderProps) {
  return (
    <header className="athletes-header">
      <div>
        <h1 className="athletes-title">Athletes</h1>
        <p className="athletes-subtitle">
          Browse and discover Texas Bombers athletes available for NIL partnerships.
        </p>
      </div>
      <div className="athletes-controls">
        <div className="athletes-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="athletes-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="athletes-search-input"
          />
        </div>
        <div className="athletes-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`athletes-filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

