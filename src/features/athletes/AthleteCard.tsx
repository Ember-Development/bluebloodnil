import { Link } from "react-router-dom";
import type { AthleteListItem } from "./types";

interface AthleteCardProps {
  athlete: AthleteListItem;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  return (
    <Link to={athlete.profileUrl} className="athlete-card">
      <div className="athlete-card-header">
        <img
          src={athlete.avatarUrl}
          alt={athlete.name}
          className="athlete-card-avatar"
        />
        <div className="athlete-card-badge">{/* Remove NIL Score badge */}</div>
      </div>
      <div className="athlete-card-body">
        <h3 className="athlete-card-name">{athlete.name}</h3>
        <p className="athlete-card-meta">
          {athlete.position} · {athlete.team}
        </p>
        <p className="athlete-card-location">
          Class of {athlete.gradYear} · {athlete.location}
        </p>
        {athlete.quickTags.length > 0 && (
          <div className="athlete-card-tags">
            {athlete.quickTags.slice(0, 2).map((tag) => (
              <span key={tag} className="athlete-card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="athlete-card-footer">
        <div className="athlete-card-stats">
          {athlete.totalReach && (
            <div className="athlete-card-stat">
              <span className="athlete-card-stat-label">Reach</span>
              <span className="athlete-card-stat-value">
                {(athlete.totalReach / 1000).toFixed(1)}K
              </span>
            </div>
          )}
          {athlete.avgEngagement && (
            <div className="athlete-card-stat">
              <span className="athlete-card-stat-label">Engagement</span>
              <span className="athlete-card-stat-value">
                {athlete.avgEngagement}%
              </span>
            </div>
          )}
          <div className="athlete-card-stat">
            <span className="athlete-card-stat-label">Campaigns</span>
            <span className="athlete-card-stat-value">
              {athlete.campaignsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
