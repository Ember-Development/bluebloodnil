import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import { AdminOverview } from './AdminOverview';
import { AthleteManagement } from './AthleteManagement';
import { BrandManagement } from './BrandManagement';
import { CampaignManagement } from './CampaignManagement';
import { TodoManagement } from './TodoManagement';
import { PostCreation } from './PostCreation';
import { NotificationCenter } from './NotificationCenter';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'athletes', label: 'Athletes' },
    { id: 'brands', label: 'Brands' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'todos', label: 'Todos' },
    { id: 'posts', label: 'Create Post' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="admin-back-button" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage athletes, brands, campaigns, and platform content</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'athletes' && <AthleteManagement />}
        {activeTab === 'brands' && <BrandManagement />}
        {activeTab === 'campaigns' && <CampaignManagement />}
        {activeTab === 'todos' && <TodoManagement />}
        {activeTab === 'posts' && <PostCreation />}
        {activeTab === 'notifications' && <NotificationCenter />}
      </div>
    </div>
  );
}

