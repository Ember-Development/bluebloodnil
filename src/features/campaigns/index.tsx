import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { CampaignCard } from './CampaignCard';
import type { AvailableCampaign } from './types';
import './campaigns.css';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<AvailableCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get<AvailableCampaign[]>('/api/athletes/campaigns/available');
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const campaignTypes: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'SOCIAL_MEDIA_POST', label: 'Social Media Post' },
    { value: 'COMMERCIAL_VIDEO', label: 'Commercial Video' },
    { value: 'IN_PERSON_APPEARANCE', label: 'In-Person Appearance' },
    { value: 'PRODUCT_ENDORSEMENT', label: 'Product Endorsement' },
    { value: 'AUTOGRAPH_SIGNING', label: 'Autograph Signing' },
    { value: 'SPEAKING_ENGAGEMENT', label: 'Speaking Engagement' },
    { value: 'PHOTO_SHOOT', label: 'Photo Shoot' },
    { value: 'PARTNERSHIP', label: 'Partnership' },
  ];

  const filteredCampaigns = selectedType === 'all'
    ? campaigns
    : campaigns.filter(c => c.type === selectedType);

  if (loading) {
    return (
      <div className="campaigns-page">
        <div className="campaigns-empty">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <h1 className="campaigns-title">Available Campaigns</h1>
        <p className="campaigns-subtitle">
          Browse and apply to open NIL campaign opportunities
        </p>
      </div>

      <div className="campaigns-filters">
        {campaignTypes.map((type) => (
          <button
            key={type.value}
            className={`filter-btn ${selectedType === type.value ? 'active' : ''}`}
            onClick={() => setSelectedType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="campaigns-empty">
          {selectedType === 'all'
            ? 'No open campaigns available at this time.'
            : `No ${campaignTypes.find(t => t.value === selectedType)?.label.toLowerCase()} campaigns available.`}
        </div>
      ) : (
        <div className="campaigns-grid">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onApplicationUpdate={fetchCampaigns}
            />
          ))}
        </div>
      )}
    </div>
  );
}

