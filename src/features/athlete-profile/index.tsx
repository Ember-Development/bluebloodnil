import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import "./profile.css";
import type {
  AthleteProfileData,
  SocialProfile,
  NILMetricTile,
  CredibilityBadge,
  AudienceBreakdown,
  ScenarioIdea,
  CampaignSummary,
  ContactChannel,
  Milestone,
} from "./types";
import { transformAthleteProfile } from "./utils";
import { CampaignsTable } from "./CampaignsTable";
import { TodosList } from "./TodosList";
import { useAuth } from "../../contexts/AuthContext";
import { ContentSection } from "./components/ContentSection";
import { Modal } from "../../components/ui/Modal";

// --- Helper renderers ---

const formatPlatformLabel = (platform: SocialProfile["platform"]) => {
  switch (platform) {
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "x":
      return "X";
    default:
      return platform;
  }
};

// --- Sub-components ---

const ProfileHeader = ({ profile }: { profile: AthleteProfileData }) => {
  const navigate = useNavigate();

  // Find the first available email from contact channels
  const orgChannels = profile.contactChannels.filter(
    (ch) => ch.type === "org" || ch.type === "agent"
  );
  const contactEmail =
    orgChannels.find((ch) => ch.email)?.email ||
    profile.contactChannels.find((ch) => ch.email)?.email ||
    "partners@bomberscollective.com"; // Fallback email

  return (
    <div className="profile-header">
      <button
        className="profile-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="profile-avatar-wrapper">
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="profile-avatar"
        />
      </div>

      <div className="profile-info">
        <h1 className="profile-name">{profile.name}</h1>
        <div className="profile-role-row">
          <div className="profile-role">
            <span className="profile-role-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
            <span>
              {profile.primaryPosition} · {profile.team}
            </span>
          </div>
          <div className="profile-meta">
            <span>
              {profile.sport} · Class of {profile.gradYear}
            </span>
            <span>Based in {profile.location}</span>
          </div>
        </div>

        <div className="profile-tags">
          {profile.quickTags.map((tag) => (
            <span key={tag} className="profile-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="profile-actions">
          <a
            href={`mailto:${contactEmail}`}
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Get In Touch
          </a>
          <button className="btn-secondary">Request media kit</button>
          {/* <button className="btn-icon" aria-label="Bookmark">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button> */}
        </div>
      </div>

      <div className="profile-stats">
        {/* <div className="stat-item">
          <span className="stat-label">Supporters</span>
          <span className="stat-value">{profile.supportersCount}</span>
        </div> */}
        <div className="stat-item">
          <span className="stat-label">Campaigns Run</span>
          <span className="stat-value">{profile.campaignsCount}</span>
        </div>
      </div>
    </div>
  );
};

const CredibilityStrip = ({ badges }: { badges: CredibilityBadge[] }) => {
  if (!badges.length) return null;
  return (
    <div className="credibility-strip">
      {badges.map((badge) => (
        <div key={badge.id} className="credibility-pill">
          <span className="credibility-dot" />
          <div className="credibility-text">
            <span className="credibility-label">{badge.label}</span>
            {badge.description && (
              <span className="credibility-description">
                {badge.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const MetricBand = ({ metrics }: { metrics: NILMetricTile[] }) => {
  if (!metrics.length) return null;
  return (
    <div className="metrics-band">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`metric-tile metric-${metric.emphasis ?? "reach"}`}
        >
          <span className="metric-label">{metric.label}</span>
          <span className="metric-value">{metric.value}</span>
          {metric.helper && (
            <span className="metric-helper">{metric.helper}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const ProfileTabs = ({
  activeTab,
  setActiveTab,
  isOwnProfile,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOwnProfile: boolean;
}) => {
  const tabs = [
    "Information",
    "Content",
    "Campaigns",
    ...(isOwnProfile ? ["My Activity"] : []),
  ];

  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-item ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const BioSection = ({ profile }: { profile: AthleteProfileData }) => {
  return (
    <div className="bio-section">
      <h3 className="section-title">Biography</h3>
      <p className="bio-text">{profile.bio}</p>

      <div className="interests-box">
        <h3 className="section-title">Interests</h3>
        <div className="interests-grid">
          {profile.interests.map((interest) => (
            <div key={interest.id} className="interest-item">
              <span
                className="interest-dot"
                style={{ backgroundColor: interest.color }}
              ></span>
              {interest.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BrandFitSection = ({ profile }: { profile: AthleteProfileData }) => {
  return (
    <div className="brand-fit-section">
      <h3 className="section-title">Brand fit & positioning</h3>
      <p className="brand-fit-summary">{profile.brandFitSummary}</p>
    </div>
  );
};

const MilestonesSection = ({
  milestones,
  canEdit,
  onAddMilestone,
}: {
  milestones: Milestone[];
  canEdit: boolean;
  onAddMilestone: (milestone: {
    title: string;
    date: string;
    description?: string;
  }) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const sorted = [...milestones].sort((a, b) => b.date.localeCompare(a.date));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    onAddMilestone({
      title: title.trim(),
      date: date.trim(),
      description: description.trim() || undefined,
    });
    setTitle("");
    setDate("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div className="milestones-container">
      <div className="milestones-header">
        <h3 className="section-title">Milestones</h3>
        {canEdit && (
          <button
            type="button"
            className="milestones-add-button"
            onClick={() => setIsAdding((prev) => !prev)}
          >
            + Add milestone
          </button>
        )}
      </div>

      {canEdit && isAdding && (
        <form className="milestones-form" onSubmit={handleSubmit}>
          <div className="milestones-form-row">
            <div className="milestones-form-group">
              <label className="milestones-label">Title</label>
              <input
                type="text"
                className="milestones-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Verbally committed to D1 program"
              />
            </div>
            <div className="milestones-form-group milestones-form-date">
              <label className="milestones-label">Date</label>
              <input
                type="date"
                className="milestones-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="milestones-form-group">
            <label className="milestones-label">Description (optional)</label>
            <textarea
              className="milestones-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note about what happened and why it matters."
            />
          </div>
          <div className="milestones-form-actions">
            <button
              type="submit"
              className="btn-primary milestones-save-button"
            >
              Save milestone
            </button>
            <button
              type="button"
              className="btn-secondary milestones-cancel-button"
              onClick={() => {
                setIsAdding(false);
                setTitle("");
                setDate("");
                setDescription("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !isAdding && (
        <p className="milestones-empty">
          {canEdit
            ? "No milestones yet — add your first big moment."
            : "Milestones will appear here as this athlete logs key moments."}
        </p>
      )}

      {sorted.length > 0 && (
        <div className="milestones-timeline">
          {sorted.map((milestone, index) => (
            <div key={milestone.id} className="milestone-row">
              <div className="milestone-marker">
                <div className="milestone-dot" />
                {index !== sorted.length - 1 && (
                  <div className="milestone-line" />
                )}
              </div>
              <div className="milestone-content">
                <div className="milestone-meta">
                  <span className="milestone-date">{milestone.date}</span>
                </div>
                <h4 className="milestone-title">{milestone.title}</h4>
                {milestone.description && (
                  <p className="milestone-description">
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MediaSection = ({ profile }: { profile: AthleteProfileData }) => {
  return (
    <div className="media-section">
      <div className="media-player">
        <img
          src={profile.media.thumbnailUrl}
          alt="Featured Media"
          className="media-thumbnail"
        />
        <div className="play-button-overlay">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="white"
            stroke="none"
          >
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const SocialMetricsPanel = ({
  socials,
  isOwnProfile,
  onRefresh,
  isRefreshing,
  onAddSocial,
}: {
  socials: SocialProfile[];
  isOwnProfile?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onAddSocial?: () => void;
}) => {
  if (!socials.length && !isOwnProfile) return null;
  return (
    <section className="panel social-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-md)",
        }}
      >
        <h3 className="section-title" style={{ margin: 0 }}>
          Social reach & engagement
        </h3>
        {isOwnProfile && (
          <div style={{ display: "flex", gap: "var(--space-sm)" }}>
            {onAddSocial && (
              <button
                onClick={onAddSocial}
                style={{
                  padding: "var(--space-xs) var(--space-sm)",
                  fontSize: "0.85rem",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                + Add Social
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  padding: "var(--space-xs) var(--space-sm)",
                  fontSize: "0.85rem",
                  background: isRefreshing
                    ? "var(--color-surface)"
                    : "var(--color-accent)",
                  color: isRefreshing
                    ? "var(--color-muted)"
                    : "var(--color-text)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-sm)",
                  cursor: isRefreshing ? "not-allowed" : "pointer",
                  opacity: isRefreshing ? 0.6 : 1,
                }}
              >
                {isRefreshing ? "Updating..." : "Update"}
              </button>
            )}
          </div>
        )}
      </div>
      {socials.length === 0 ? (
        <div
          style={{
            padding: "var(--space-xl)",
            textAlign: "center",
            color: "var(--color-muted)",
          }}
        >
          No social profiles added yet.
        </div>
      ) : (
        <div className="social-metrics-grid">
          {socials.map((s) => (
            <div key={s.platform} className="social-card">
              <div className="social-header">
                <span className="social-platform">
                  {formatPlatformLabel(s.platform)}
                </span>
                <span className="social-handle">{s.handle}</span>
              </div>
              <div className="social-stats">
                <div>
                  <span className="social-stat-label">Followers</span>
                  <span className="social-stat-value">
                    {s.followers.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="social-stat-label">Avg engagement</span>
                  <span className="social-stat-value">
                    {s.avgEngagementRate != null
                      ? `${s.avgEngagementRate}%`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="social-stat-label">Typical views</span>
                  <span className="social-stat-value">
                    {s.avgViews != null ? s.avgViews.toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>
              <p className="social-footnote">{s.postingCadence}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const AudiencePanel = ({ audience }: { audience: AudienceBreakdown }) => {
  // If no audience data at all, don't render
  const hasDetailedData =
    audience.ageBands?.length ||
    audience.locations?.length ||
    audience.interests?.length;
  const hasSimpleData =
    audience.primaryMarkets?.length || audience.targetAudience;

  if (!hasDetailedData && !hasSimpleData) {
    return null;
  }

  return (
    <section className="panel audience-panel">
      <h3 className="section-title">Audience & markets</h3>

      {/* Simple format - easier to populate */}
      {!hasDetailedData && hasSimpleData && (
        <div className="audience-simple">
          {audience.targetAudience && (
            <div className="audience-simple-item">
              <h4 className="audience-heading">Target Audience</h4>
              <p className="audience-description">{audience.targetAudience}</p>
            </div>
          )}
          {audience.primaryMarkets && audience.primaryMarkets.length > 0 && (
            <div className="audience-simple-item">
              <h4 className="audience-heading">Primary Markets</h4>
              <div className="audience-markets">
                {audience.primaryMarkets.map((market, index) => (
                  <span key={index} className="audience-market-tag">
                    {market}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed format - if analytics data is available */}
      {hasDetailedData && (
        <div className="audience-columns">
          {audience.ageBands && audience.ageBands.length > 0 && (
            <div>
              <h4 className="audience-heading">Who follows</h4>
              <ul className="audience-list">
                {audience.ageBands.map((a) => (
                  <li key={a.label}>
                    <span className="audience-label">{a.label}</span>
                    <span className="audience-value">{a.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {audience.locations && audience.locations.length > 0 && (
            <div>
              <h4 className="audience-heading">Where they are</h4>
              <ul className="audience-list">
                {audience.locations.map((a) => (
                  <li key={a.label}>
                    <span className="audience-label">{a.label}</span>
                    <span className="audience-value">{a.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {audience.interests && audience.interests.length > 0 && (
            <div>
              <h4 className="audience-heading">What they care about</h4>
              <ul className="audience-list">
                {audience.interests.map((a) => (
                  <li key={a.label}>
                    <span className="audience-label">{a.label}</span>
                    <span className="audience-value">{a.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const ScenarioCards = ({ ideas }: { ideas: ScenarioIdea[] }) => {
  if (!ideas.length) return null;
  return (
    <section className="panel scenario-panel">
      <h3 className="section-title">How Anabella can help your brand</h3>
      <div className="scenario-grid">
        {ideas.map((idea) => (
          <article key={idea.id} className="scenario-card">
            <h4 className="scenario-title">{idea.title}</h4>
            <p className="scenario-goal">{idea.goal}</p>
            <p className="scenario-description">{idea.description}</p>
            <p className="scenario-ideal">Best fit: {idea.idealBrands}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

const CampaignsSection = ({ campaigns }: { campaigns: CampaignSummary[] }) => {
  if (!campaigns.length) {
    return (
      <section className="campaigns-section">
        <h3 className="section-title">Campaigns & Outcomes</h3>
        <p className="campaigns-empty">
          No paid collaborations logged yet — great opportunity for a
          first-mover partner.
        </p>
      </section>
    );
  }

  return (
    <section className="campaigns-section">
      <h3 className="section-title">Campaigns & Outcomes</h3>
      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="campaign-card">
            <header className="campaign-header">
              <div className="campaign-brand">
                <img
                  src={campaign.brandLogoUrl}
                  alt={campaign.brand}
                  className="campaign-logo"
                />
                <div>
                  <h4 className="campaign-title">{campaign.title}</h4>
                  <p className="campaign-brand-name">{campaign.brand}</p>
                </div>
              </div>
              <p className="campaign-objective">{campaign.objective}</p>
            </header>
            <div className="campaign-body">
              <div className="campaign-column">
                <h5>Deliverables</h5>
                <p>{campaign.objective || "No description available"}</p>
              </div>
              <div className="campaign-column">
                <h5>Results</h5>
                {campaign.results &&
                  (() => {
                    const hasResults =
                      (campaign.results.links &&
                        campaign.results.links.length > 0) ||
                      (campaign.results.metrics &&
                        Object.values(campaign.results.metrics).some(
                          (v) => v && v.toString().trim()
                        )) ||
                      (campaign.results.mediaUrls &&
                        campaign.results.mediaUrls.length > 0) ||
                      (campaign.results.notes && campaign.results.notes.trim());

                    if (!hasResults) {
                      return (
                        <p
                          style={{
                            color: "var(--color-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Results coming soon
                        </p>
                      );
                    }

                    return (
                      <div>
                        {campaign.results.links &&
                          campaign.results.links.length > 0 && (
                            <div style={{ marginBottom: "var(--space-sm)" }}>
                              <strong>Content Links:</strong>
                              <ul
                                style={{
                                  marginTop: "4px",
                                  paddingLeft: "var(--space-md)",
                                }}
                              >
                                {campaign.results.links.map((link, index) => (
                                  <li key={index}>
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "var(--color-accentSoft)",
                                      }}
                                    >
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {campaign.results.metrics &&
                          Object.entries(campaign.results.metrics).some(
                            ([_, value]) => value && value.toString().trim()
                          ) && (
                            <div style={{ marginBottom: "var(--space-sm)" }}>
                              <strong>Metrics:</strong>
                              <ul
                                style={{
                                  marginTop: "4px",
                                  paddingLeft: "var(--space-md)",
                                }}
                              >
                                {Object.entries(campaign.results.metrics).map(
                                  ([key, value]) => {
                                    if (!value || !value.toString().trim())
                                      return null;
                                    return (
                                      <li key={key}>
                                        {key.charAt(0).toUpperCase() +
                                          key.slice(1).replace(/_/g, " ")}
                                        : {value}
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            </div>
                          )}
                        {campaign.results.mediaUrls &&
                          campaign.results.mediaUrls.length > 0 && (
                            <div style={{ marginBottom: "var(--space-sm)" }}>
                              <strong>Media:</strong>
                              <ul
                                style={{
                                  marginTop: "4px",
                                  paddingLeft: "var(--space-md)",
                                }}
                              >
                                {campaign.results.mediaUrls.map(
                                  (url, index) => (
                                    <li key={index}>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "var(--color-accentSoft)",
                                        }}
                                      >
                                        {url}
                                      </a>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {campaign.results.notes &&
                          campaign.results.notes.trim() && (
                            <div style={{ marginTop: "var(--space-sm)" }}>
                              <strong>Notes:</strong>
                              <p
                                style={{
                                  marginTop: "4px",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {campaign.results.notes}
                              </p>
                            </div>
                          )}
                      </div>
                    );
                  })()}
                {!campaign.results && (
                  <p
                    style={{ color: "var(--color-muted)", fontStyle: "italic" }}
                  >
                    Results coming soon
                  </p>
                )}
              </div>
            </div>
            {campaign.quote && (
              <p className="campaign-quote">“{campaign.quote}”</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const ParentContactPanel = ({ channels }: { channels: ContactChannel[] }) => {
  const parentContacts = channels.filter((ch) => ch.type === "parent");

  if (!parentContacts.length) return null;

  return (
    <section className="panel parent-contact-panel">
      <h3 className="section-title">Parent/Guardian Contact</h3>
      <div className="parent-contact-list">
        {parentContacts.map((contact) => (
          <div key={contact.name} className="parent-contact-item">
            <div className="parent-contact-header">
              <span className="parent-contact-name">{contact.name}</span>
              {contact.role && (
                <span className="parent-contact-role">{contact.role}</span>
              )}
            </div>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="parent-contact-link"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="parent-contact-link">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contact.phone}
              </a>
            )}
            {contact.notes && (
              <p className="parent-contact-notes">{contact.notes}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const ContactCTA = ({ channels }: { channels: ContactChannel[] }) => {
  const orgChannels = channels.filter(
    (ch) => ch.type === "org" || ch.type === "agent"
  );
  if (!orgChannels.length) return null;
  const primary = orgChannels[0];

  return (
    <section className="contact-cta">
      <div>
        <h3 className="section-title">Ready to explore a NIL campaign?</h3>
        <p className="contact-copy">
          Share your goal — awareness, camp sign-ups, traffic, or product
          launches — and the BlueBlood NIL desk will help design a program with
          Anabella that fits your budget and timeline.
        </p>
        <ul className="contact-list">
          {orgChannels.map((ch) => (
            <li key={ch.type}>
              <span className="contact-role">
                {ch.role} · {ch.name}
              </span>
              {ch.email && <span className="contact-email">{ch.email}</span>}
              {ch.notes && <span className="contact-notes">{ch.notes}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="contact-actions">
        {primary.email && (
          <a
            className="btn-primary contact-btn"
            href={`mailto:${primary.email}`}
          >
            Email NIL desk
          </a>
        )}
        <button className="btn-secondary contact-btn">
          Download media kit
        </button>
      </div>
    </section>
  );
};

// --- Main Page Component ---

export const AthleteProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Information");
  const [profile, setProfile] = useState<AthleteProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [newSocialProfile, setNewSocialProfile] = useState({
    platform: "instagram" as "instagram" | "tiktok" | "youtube" | "x",
    handle: "",
    postingCadence: "",
  });

  useEffect(() => {
    async function fetchAthleteProfile() {
      if (!id) {
        setError("Athlete ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const isOwnProfile = user?.athlete?.id === id;
        const data = await apiClient.get<any>(`/api/athletes/${id}`);

        // If viewing own profile, fetch todos separately
        let todos = [];
        if (isOwnProfile) {
          try {
            todos = await apiClient.get<any[]>("/api/athletes/me/todos");
          } catch (todoErr) {
            console.error("Failed to fetch todos:", todoErr);
            // Don't fail the whole profile load if todos fail
          }
        }

        // Fetch feed posts for this athlete
        let feedPosts = [];
        try {
          feedPosts = await apiClient.get<any[]>(
            `/api/athletes/${id}/feed-posts`
          );
        } catch (feedErr) {
          console.error("Failed to fetch feed posts:", feedErr);
          // Don't fail the whole profile load if feed posts fail
        }

        const transformed = transformAthleteProfile(
          { ...data, todos },
          feedPosts
        );
        setProfile(transformed);
        setMilestones(
          (transformed.milestones || [])
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
        );
      } catch (err) {
        console.error("Failed to fetch athlete profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load athlete profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAthleteProfile();
  }, [id, user?.athlete?.id]);

  // Reset to Information tab if viewing someone else's profile while on My Activity tab
  useEffect(() => {
    if (profile && activeTab === "My Activity") {
      const isOwnProfileCheck = user?.athlete?.id === profile.id;
      if (!isOwnProfileCheck) {
        setActiveTab("Information");
      }
    }
  }, [profile?.id, user?.athlete?.id, activeTab]);

  const handleAddMilestone = async (milestone: {
    title: string;
    date: string;
    description?: string;
  }) => {
    try {
      const savedMilestone = await apiClient.post<{
        id: string;
        title: string;
        date: string;
        description?: string | null;
      }>("/api/athletes/me/milestones", milestone);

      const newMilestone: Milestone = {
        id: savedMilestone.id,
        title: savedMilestone.title,
        date: savedMilestone.date.split("T")[0], // Convert ISO date to YYYY-MM-DD format
        description: savedMilestone.description || undefined,
      };

      setMilestones((prev) =>
        [newMilestone, ...prev]
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    } catch (error) {
      console.error("Failed to save milestone:", error);
      alert("Failed to save milestone. Please try again.");
    }
  };

  const handleRefreshSocialMetrics = async () => {
    if (!user?.athlete?.id) return;

    try {
      setIsRefreshingMetrics(true);
      await apiClient.post("/api/athletes/me/social-profiles/refresh", {});

      // Refetch profile to get updated metrics
      const data = await apiClient.get<any>(`/api/athletes/${id}`);
      const transformed = transformAthleteProfile(data, []);
      setProfile(transformed);
    } catch (error) {
      console.error("Failed to refresh social metrics:", error);
      alert("Failed to refresh social metrics. Please try again.");
    } finally {
      setIsRefreshingMetrics(false);
    }
  };

  const handleAddSocialProfile = async () => {
    if (!newSocialProfile.handle.trim()) {
      alert("Please enter a handle");
      return;
    }

    if (!newSocialProfile.postingCadence) {
      alert("Please select a posting cadence");
      return;
    }

    if (!profile) {
      alert("Profile not loaded. Please refresh the page.");
      return;
    }

    try {
      // Get current social profiles and add the new one
      const currentProfiles = profile.socialProfiles.map((sp) => ({
        platform: sp.platform,
        handle: sp.handle,
        postingCadence: sp.postingCadence,
      }));

      const updatedProfiles = [
        ...currentProfiles,
        {
          platform: newSocialProfile.platform,
          handle: newSocialProfile.handle.trim(),
          postingCadence: newSocialProfile.postingCadence,
        },
      ];

      await apiClient.put("/api/athletes/me/social-profiles", {
        socialProfiles: updatedProfiles,
      });

      // Reset form and close modal
      setNewSocialProfile({
        platform: "instagram",
        handle: "",
        postingCadence: "",
      });
      setShowAddSocialModal(false);

      // Refetch profile to get updated social profiles
      const data = await apiClient.get<any>(`/api/athletes/${id}`);
      const transformed = transformAthleteProfile(data, []);
      setProfile(transformed);
    } catch (error) {
      console.error("Failed to add social profile:", error);
      alert("Failed to add social profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-text)",
          }}
        >
          Loading athlete profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-container">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--color-danger)",
          }}
        >
          {error || "Athlete profile not found"}
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={() => navigate("/athletes")}
              className="btn-primary"
            >
              Back to Athletes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.athlete?.id === profile.id;

  return (
    <div className="profile-container">
      <ProfileHeader profile={profile} />
      <CredibilityStrip badges={profile.credibilityBadges} />
      <MetricBand metrics={profile.nilMetrics} />

      <div className="profile-content-wrapper">
        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwnProfile={isOwnProfile}
        />

        {activeTab === "Information" && (
          <div className="profile-content-grid">
            <div className="left-column">
              <BioSection profile={profile} />
              <BrandFitSection profile={profile} />
              <MilestonesSection
                milestones={milestones}
                canEdit={!!isOwnProfile}
                onAddMilestone={handleAddMilestone}
              />
            </div>

            <div className="right-column">
              <MediaSection profile={profile} />
              <SocialMetricsPanel
                socials={profile.socialProfiles}
                isOwnProfile={isOwnProfile}
                onRefresh={handleRefreshSocialMetrics}
                isRefreshing={isRefreshingMetrics}
                onAddSocial={() => setShowAddSocialModal(true)}
              />
              <ParentContactPanel channels={profile.contactChannels} />
              <AudiencePanel audience={profile.audience} />
              <ScenarioCards ideas={profile.scenarioIdeas} />
            </div>
          </div>
        )}

        {activeTab === "Campaigns" && (
          <CampaignsSection campaigns={profile.campaigns} />
        )}

        {activeTab === "Content" && (
          <ContentSection
            brandContent={profile.brandContent}
            feedPosts={profile.feedPosts}
            athleteName={profile.name}
          />
        )}

        {activeTab === "My Activity" && isOwnProfile && (
          <div className="activity-tab-content">
            <CampaignsTable
              campaigns={profile.campaignsWithEarnings}
              totalEarnings={profile.totalEarnings}
            />
            <TodosList
              todos={profile.todos || []}
              campaigns={profile.campaignsWithEarnings.map((c) => ({
                id: c.id,
                title: c.title,
              }))}
              onTodoUpdate={() => {
                // Refetch todos when updated
                if (isOwnProfile) {
                  apiClient
                    .get<any[]>("/api/athletes/me/todos")
                    .then((todos) => {
                      setProfile((prev) => (prev ? { ...prev, todos } : null));
                    })
                    .catch((err) =>
                      console.error("Failed to refresh todos:", err)
                    );
                }
              }}
            />
          </div>
        )}

        {activeTab === "Goatnet" && (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--color-muted)",
            }}
          >
            Goatnet integration placeholder.
          </div>
        )}
      </div>

      <ContactCTA channels={profile.contactChannels} />

      {/* Add Social Profile Modal */}
      <Modal
        isOpen={showAddSocialModal}
        onClose={() => {
          setShowAddSocialModal(false);
          setNewSocialProfile({
            platform: "instagram",
            handle: "",
            postingCadence: "",
          });
        }}
        title="Add Social Media Profile"
        size="medium"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-muted)",
                marginBottom: "var(--space-xs)",
                fontWeight: 600,
              }}
            >
              Platform
            </label>
            <select
              value={newSocialProfile.platform}
              onChange={(e) =>
                setNewSocialProfile({
                  ...newSocialProfile,
                  platform: e.target.value as typeof newSocialProfile.platform,
                })
              }
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                background: "rgba(6, 7, 12, 0.8)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
              }}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="x">X (Twitter)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-muted)",
                marginBottom: "var(--space-xs)",
                fontWeight: 600,
              }}
            >
              Handle
            </label>
            <input
              type="text"
              value={newSocialProfile.handle}
              onChange={(e) =>
                setNewSocialProfile({
                  ...newSocialProfile,
                  handle: e.target.value,
                })
              }
              placeholder="@username"
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                background: "rgba(6, 7, 12, 0.8)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-muted)",
                marginBottom: "var(--space-xs)",
                fontWeight: 600,
              }}
            >
              Posting Cadence
            </label>
            <select
              value={newSocialProfile.postingCadence}
              onChange={(e) =>
                setNewSocialProfile({
                  ...newSocialProfile,
                  postingCadence: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                background: "rgba(6, 7, 12, 0.8)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text)",
                fontSize: "0.9rem",
              }}
            >
              <option value="">Select posting cadence...</option>
              <option value="Daily">Daily</option>
              <option value="4-5 posts per week">4-5 posts per week</option>
              <option value="2-3 posts per week">2-3 posts per week</option>
              <option value="Weekly">Weekly</option>
              <option value="2-3 posts per month">2-3 posts per month</option>
              <option value="Monthly">Monthly</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Never">Never</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              marginTop: "var(--space-md)",
            }}
          >
            <button
              onClick={handleAddSocialProfile}
              style={{
                flex: 1,
                padding: "var(--space-sm) var(--space-md)",
                background:
                  "linear-gradient(90deg, var(--color-accent), var(--color-danger))",
                color: "var(--color-bg)",
                border: "none",
                borderRadius: "var(--radius-pill)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              Add Profile
            </button>
            <button
              onClick={() => {
                setShowAddSocialModal(false);
                setNewSocialProfile({
                  platform: "instagram",
                  handle: "",
                  postingCadence: "",
                });
              }}
              style={{
                flex: 1,
                padding: "var(--space-sm) var(--space-md)",
                background: "transparent",
                color: "var(--color-text)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-pill)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
