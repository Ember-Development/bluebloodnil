interface MembersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

const FILTERS = ["All", "Brands", "Facilities", "Sponsors", "Partners"];

export function MembersHeader({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: MembersHeaderProps) {
  return (
    <header className="members-header">
      <div>
        <h1 className="members-title">Brand Partners</h1>
        <p className="members-subtitle">
          Explore our network of NIL partners, training facilities, and brand
          sponsors.
        </p>
      </div>
      <div className="members-controls">
        <div className="members-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="members-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="members-search-input"
          />
        </div>
        <div className="members-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`members-filter-pill ${activeFilter === filter ? "active" : ""}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
