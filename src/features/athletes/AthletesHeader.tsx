interface AthletesHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: {
    ageGroup: string;
    gradYear: string;
    location: string;
    teamName: string;
  };
  onFilterChange: (
    type: "ageGroup" | "gradYear" | "location" | "teamName",
    value: string
  ) => void;
  filterOptions: Array<{
    type: "ageGroup" | "gradYear" | "location" | "teamName";
    label: string;
    value: string;
  }>;
}

export function AthletesHeader({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterOptions,
}: AthletesHeaderProps) {
  // Group filter options by type
  const ageGroupOptions = filterOptions.filter(
    (opt) => opt.type === "ageGroup"
  );
  const gradYearOptions = filterOptions.filter(
    (opt) => opt.type === "gradYear"
  );
  const locationOptions = filterOptions.filter(
    (opt) => opt.type === "location"
  );
  const teamNameOptions = filterOptions.filter(
    (opt) => opt.type === "teamName"
  );

  return (
    <header className="athletes-header">
      <div>
        <h1 className="athletes-title">Athletes</h1>
        <p className="athletes-subtitle">
          Browse and discover Texas Bombers athletes available for NIL
          partnerships.
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
        <div
          className="athletes-filters"
          style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}
        >
          {/* Age Group Dropdown */}
          {ageGroupOptions.length > 0 && (
            <select
              className="athletes-filter-dropdown"
              value={activeFilter.ageGroup}
              onChange={(e) => onFilterChange("ageGroup", e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-line)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="">All Age Groups</option>
              {ageGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Grad Year Dropdown */}
          {gradYearOptions.length > 0 && (
            <select
              className="athletes-filter-dropdown"
              value={activeFilter.gradYear}
              onChange={(e) => onFilterChange("gradYear", e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-line)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="">All Grad Years</option>
              {gradYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Location Dropdown */}
          {locationOptions.length > 0 && (
            <select
              className="athletes-filter-dropdown"
              value={activeFilter.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-line)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="">All Locations</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Team Name Dropdown */}
          {teamNameOptions.length > 0 && (
            <select
              className="athletes-filter-dropdown"
              value={activeFilter.teamName}
              onChange={(e) => onFilterChange("teamName", e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-line)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value="">All Teams</option>
              {teamNameOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </header>
  );
}
