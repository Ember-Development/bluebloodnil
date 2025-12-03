import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import type { FeedItem } from './types'
import { formatTag, getItemAccentClass } from './utils'

interface FeedCardProps {
  item: FeedItem
  onApplicationUpdate?: () => void;
}

export function FeedCard({ item, onApplicationUpdate }: FeedCardProps) {
  const accentClass = getItemAccentClass(item.type)
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (item.type !== 'campaign') return;
    const campaignItem = item as Extract<FeedItem, { type: 'campaign' }>;
    if (!campaignItem.campaignId || !user || user.role !== 'ATHLETE') return;
    
    setApplying(true);
    try {
      await apiClient.post(`/api/athletes/campaigns/${campaignItem.campaignId}/apply`, {});
      setApplied(true);
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Failed to apply to campaign:', error);
      alert('Failed to apply to campaign. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <article className={`feed-card ${accentClass}`}>
      <header className="feed-card-header">
        <div className="feed-card-author">
          <img src={item.author.avatarUrl} alt={item.author.name} className="feed-card-avatar" />
          <div>
            <div className="feed-card-author-row">
              <span className="feed-card-author-name">{item.author.name}</span>
              <span className="feed-card-dot">•</span>
              <span className="feed-card-time">{item.timeAgo}</span>
            </div>
            <p className="feed-card-author-meta">{item.author.role}</p>
          </div>
        </div>
        <span className="feed-card-pill">{labelForType(item.type)}</span>
      </header>

      <div className="feed-card-body">
        <h3 className="feed-card-headline">{item.headline}</h3>
        <p className="feed-card-text">{item.body}</p>

        {item.type === 'athlete_update' && 'statLine' in item && item.statLine && (
          <p className="feed-card-statline">{item.statLine}</p>
        )}

        {item.type === 'campaign' && 'brand' in item && (
          <div className="feed-card-campaign-meta">
            <div className="feed-card-brand">
              <img
                src={item.brandLogoUrl}
                alt={item.brand}
                className="feed-card-brand-logo"
              />
              <span>{item.brand}</span>
            </div>
            <span className={`feed-card-status status-${item.status}`}>
              {item.status === 'planning' && 'Planning'}
              {item.status === 'live' && 'Live'}
              {item.status === 'wrapped' && 'Wrapped'}
            </span>
          </div>
        )}
      </div>

      <footer className="feed-card-footer">
        <div className="feed-card-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="feed-card-tag">
              {formatTag(tag)}
            </span>
          ))}
        </div>
        {item.type === 'campaign' && (() => {
          const campaignItem = item as Extract<FeedItem, { type: 'campaign' }>;
          if (!campaignItem.isOpen || !campaignItem.campaignId || user?.role !== 'ATHLETE') {
            return null;
          }
          return (
            <div style={{ marginTop: 'var(--space-md)' }}>
              {applied ? (
                <button className="btn-action" disabled style={{ opacity: 0.6 }}>
                  Applied ✓
                </button>
              ) : (
                <button
                  className="btn-action"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? 'Applying...' : 'Apply to Campaign'}
                </button>
              )}
            </div>
          );
        })()}
      </footer>
    </article>
  )
}

const labelForType = (type: FeedItem['type']): string => {
  switch (type) {
    case 'athlete_update':
      return 'Athlete update'
    case 'campaign':
      return 'Campaign recap'
    case 'org_announcement':
      return 'Org announcement'
    case 'commitment':
      return 'Commitment'
    default:
      return 'Update'
  }
}

