import { useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import type { AvailableCampaign } from './types';
import './campaigns.css';

interface CampaignCardProps {
  campaign: AvailableCampaign;
  onApplicationUpdate?: () => void;
}

const campaignTypeLabels: Record<AvailableCampaign['type'], string> = {
  SOCIAL_MEDIA_POST: 'Social Media Post',
  COMMERCIAL_VIDEO: 'Commercial Video',
  IN_PERSON_APPEARANCE: 'In-Person Appearance',
  PRODUCT_ENDORSEMENT: 'Product Endorsement',
  AUTOGRAPH_SIGNING: 'Autograph Signing',
  SPEAKING_ENGAGEMENT: 'Speaking Engagement',
  PHOTO_SHOOT: 'Photo Shoot',
  PARTNERSHIP: 'Partnership',
};

export function CampaignCard({ campaign, onApplicationUpdate }: CampaignCardProps) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await apiClient.post(`/api/athletes/campaigns/${campaign.id}/apply`, {});
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
    <div className="campaign-card">
      <div className="campaign-card-header">
        <div className="campaign-card-brand">
          {campaign.organization.logoUrl && (
            <img
              src={campaign.organization.logoUrl}
              alt={campaign.organization.name}
              className="campaign-card-logo"
            />
          )}
          <div>
            <div className="campaign-card-brand-name">{campaign.organization.name}</div>
            <div className="campaign-card-type">{campaignTypeLabels[campaign.type]}</div>
          </div>
        </div>
        <span className="campaign-card-badge">Open</span>
      </div>
      <div className="campaign-card-body">
        <h3 className="campaign-card-title">{campaign.title}</h3>
        {campaign.description && (
          <p className="campaign-card-description">{campaign.description}</p>
        )}
        {campaign.type === 'IN_PERSON_APPEARANCE' && campaign.address && (
          <div className="campaign-card-address">
            <strong>Location:</strong> {campaign.address}
          </div>
        )}
        {campaign.totalEarnings && (
          <div className="campaign-card-earnings">
            <strong>Total Earnings:</strong> ${campaign.totalEarnings.toLocaleString()}
          </div>
        )}
      </div>
      <div className="campaign-card-footer">
        {applied ? (
          <button className="campaign-card-apply-btn applied" disabled>
            Applied ✓
          </button>
        ) : (
          <button
            className="campaign-card-apply-btn"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Applying...' : 'Apply to Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}

