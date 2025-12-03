import { FeedCard } from '../../feed/FeedCard';
import type { FeedItem } from '../../feed/types';
import type { BrandContentItem } from '../types';
import './ContentSection.css';

interface ContentSectionProps {
  brandContent: BrandContentItem[];
  feedPosts: FeedItem[];
  athleteName: string;
}

export function ContentSection({ brandContent, feedPosts, athleteName }: ContentSectionProps) {
  const hasContent = brandContent.length > 0 || feedPosts.length > 0;

  if (!hasContent) {
    return (
      <div className="content-section-empty">
        <p>No content available yet.</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      {/* Brand Content Section */}
      {brandContent.length > 0 && (
        <section className="content-section-brand">
          <h3 className="content-section-title">Brand Content</h3>
          <p className="content-section-subtitle">
            Social media posts and content created for brand campaigns
          </p>
          <div className="content-grid">
            {brandContent.map((content) => (
              <article key={content.id} className="content-card">
                <div className="content-card-media">
                  {content.type === 'video' ? (
                    <div className="content-video-wrapper">
                      <img
                        src={content.mediaUrl}
                        alt={content.caption || 'Content'}
                        className="content-media"
                      />
                      <div className="content-play-overlay">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={content.mediaUrl}
                      alt={content.caption || 'Content'}
                      className="content-media"
                    />
                  )}
                </div>
                <div className="content-card-body">
                  {content.brandName && (
                    <div className="content-brand-info">
                      {content.brandLogoUrl && (
                        <img
                          src={content.brandLogoUrl}
                          alt={content.brandName}
                          className="content-brand-logo"
                        />
                      )}
                      <div>
                        <span className="content-brand-name">{content.brandName}</span>
                        {content.campaignTitle && (
                          <span className="content-campaign-title">{content.campaignTitle}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {content.caption && (
                    <p className="content-caption">{content.caption}</p>
                  )}
                  <span className="content-date">
                    {new Date(content.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Feed Posts Section */}
      {feedPosts.length > 0 && (
        <section className="content-section-feed">
          <h3 className="content-section-title">Feed Posts</h3>
          <p className="content-section-subtitle">
            Posts about {athleteName} from the community feed
          </p>
          <div className="content-feed-list">
            {feedPosts.map((post) => (
              <FeedCard key={post.id} item={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

