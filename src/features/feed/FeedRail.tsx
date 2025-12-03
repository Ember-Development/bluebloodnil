import { Link } from 'react-router-dom'
import { useChatbot } from '../../contexts/ChatbotContext'
import {
  MOCK_TRENDING_ATHLETES,
  MOCK_FEATURED_CAMPAIGN,
  type TrendingAthlete,
  type FeaturedCampaign,
} from './types'

export function FeedRail() {
  return (
    <aside className="feed-rail">
      <AIChatbotCTA />
      <TrendingAthletes athletes={MOCK_TRENDING_ATHLETES} />
      <FeaturedCampaign campaign={MOCK_FEATURED_CAMPAIGN} />
    </aside>
  )
}

function AIChatbotCTA() {
  const { openChatbot } = useChatbot();

  return (
    <div className="feed-rail-card feed-rail-chatbot">
      <h3 className="feed-rail-title">Need help?</h3>
      <p className="feed-rail-text">
        Chat with our AI NIL assistant to find the right athlete, explore campaign ideas, or get
        answers about Texas HS NIL rules.
      </p>
      <button
        className="feed-rail-chatbot-btn"
        onClick={openChatbot}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Chat with AI assistant
      </button>
    </div>
  )
}

function TrendingAthletes({ athletes }: { athletes: TrendingAthlete[] }) {
  return (
    <div className="feed-rail-card">
      <h3 className="feed-rail-title">Trending athletes</h3>
      <div className="feed-rail-athletes">
        {athletes.map((athlete) => (
          <Link key={athlete.id} to={athlete.profileUrl} className="feed-rail-athlete">
            <img src={athlete.avatarUrl} alt={athlete.name} className="feed-rail-athlete-avatar" />
            <div className="feed-rail-athlete-info">
              <div className="feed-rail-athlete-name">{athlete.name}</div>
              <div className="feed-rail-athlete-meta">
                {athlete.position} · {athlete.team}
              </div>
              <div className="feed-rail-athlete-activity">{athlete.recentActivity}</div>
              {athlete.nilScore && (
                <div className="feed-rail-athlete-score">NIL Score: {athlete.nilScore}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function FeaturedCampaign({ campaign }: { campaign: FeaturedCampaign }) {
  return (
    <div className="feed-rail-card feed-rail-campaign">
      <h3 className="feed-rail-title">Featured campaign</h3>
      <div className="feed-rail-campaign-header">
        <img src={campaign.brandLogoUrl} alt={campaign.brand} className="feed-rail-campaign-logo" />
        <div>
          <div className="feed-rail-campaign-brand">{campaign.brand}</div>
          <div className="feed-rail-campaign-title">{campaign.title}</div>
        </div>
      </div>
      <p className="feed-rail-campaign-objective">{campaign.objective}</p>
      <div className="feed-rail-campaign-metrics">
        {campaign.metrics.impressions && (
          <div className="feed-rail-metric">
            <span className="feed-rail-metric-label">Impressions</span>
            <span className="feed-rail-metric-value">{campaign.metrics.impressions}</span>
          </div>
        )}
        {campaign.metrics.engagement && (
          <div className="feed-rail-metric">
            <span className="feed-rail-metric-label">Engagement</span>
            <span className="feed-rail-metric-value">{campaign.metrics.engagement}</span>
          </div>
        )}
        {campaign.metrics.conversions && (
          <div className="feed-rail-metric">
            <span className="feed-rail-metric-label">Conversions</span>
            <span className="feed-rail-metric-value">{campaign.metrics.conversions}</span>
          </div>
        )}
      </div>
      <div className={`feed-rail-campaign-status status-${campaign.status}`}>
        {campaign.status === 'live' && 'Live now'}
        {campaign.status === 'wrapped' && 'Wrapped'}
        {campaign.status === 'planning' && 'Planning'}
      </div>
    </div>
  )
}


