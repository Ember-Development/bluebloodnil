import './admin.css';

// Mock data - replace with API calls
const MOCK_METRICS = {
  totalAthletes: 24,
  activeCampaigns: 8,
  totalEarnings: 125000,
  pendingTodos: 12,
  totalBrands: 15,
  avgEngagement: 7.2,
  recentActivity: [
    { label: 'New athlete added', value: 'Anabella Abdullah', timeAgo: '2 hours ago' },
    { label: 'Campaign completed', value: 'Houston Training Lab', timeAgo: '5 hours ago' },
    { label: 'New brand partner', value: 'Elite Softball Gear', timeAgo: '1 day ago' },
    { label: 'Post published', value: 'Dallas Showcase Highlights', timeAgo: '2 days ago' },
  ],
};

export function AdminOverview() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overview-section">
      <div className="overview-grid">
        <div className="metric-card">
          <div className="metric-label">Total Athletes</div>
          <div className="metric-value">{MOCK_METRICS.totalAthletes}</div>
          <div className="metric-change">+3 this month</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Campaigns</div>
          <div className="metric-value">{MOCK_METRICS.activeCampaigns}</div>
          <div className="metric-change">+2 this week</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Earnings</div>
          <div className="metric-value">{formatCurrency(MOCK_METRICS.totalEarnings)}</div>
          <div className="metric-change">+15% vs last month</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Pending Todos</div>
          <div className="metric-value">{MOCK_METRICS.pendingTodos}</div>
          <div className="metric-change negative">3 overdue</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Brand Partners</div>
          <div className="metric-value">{MOCK_METRICS.totalBrands}</div>
          <div className="metric-change">+2 this month</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Engagement</div>
          <div className="metric-value">{MOCK_METRICS.avgEngagement}%</div>
          <div className="metric-change">+0.8% vs last month</div>
        </div>
      </div>

      <div className="activity-list">
        <h3 className="section-title" style={{ marginBottom: 'var(--space-lg)' }}>
          Recent Activity
        </h3>
        {MOCK_METRICS.recentActivity.map((activity, index) => (
          <div key={index} className="activity-item">
            <div>
              <div className="activity-label">{activity.label}</div>
              <div className="activity-value">{activity.value}</div>
            </div>
            <div className="activity-time">{activity.timeAgo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

