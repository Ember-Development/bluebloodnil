import { type CampaignWithEarnings } from './types';
import './profile.css';

interface CampaignsTableProps {
  campaigns: CampaignWithEarnings[];
  totalEarnings: number;
}

export const CampaignsTable = ({ campaigns, totalEarnings }: CampaignsTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: CampaignWithEarnings['status']) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'completed':
        return 'status-badge status-completed';
      case 'pending':
        return 'status-badge status-pending';
      case 'cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  const getStatusLabel = (status: CampaignWithEarnings['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const depositedEarnings = campaigns.filter((c) => c.paid).reduce((sum, c) => sum + c.earnings, 0);
  const availableEarnings = campaigns.filter((c) => !c.paid).reduce((sum, c) => sum + c.earnings, 0);

  return (
    <div className="campaigns-dashboard">
      <div className="earnings-summary">
        <div className="earnings-card">
          <div className="earnings-label">Total Earnings</div>
          <div className="earnings-value">{formatCurrency(totalEarnings)}</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">In Trust</div>
          <div className="earnings-value earnings-paid">{formatCurrency(depositedEarnings)}</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">Available</div>
          <div className="earnings-value earnings-pending">{formatCurrency(availableEarnings)}</div>
        </div>
      </div>

      <div className="campaigns-table-container">
        <h3 className="section-title">Campaigns</h3>
        <table className="campaigns-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Brand</th>
              <th>Period</th>
              <th>Status</th>
              <th>Earnings</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-muted)' }}>
                  No campaigns yet. Campaigns you're assigned to will appear here.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <div className="campaign-cell">
                    <img
                      src={campaign.brandLogoUrl}
                      alt={campaign.brand}
                      className="campaign-table-logo"
                    />
                    <div>
                      <div className="campaign-table-title">{campaign.title}</div>
                      {campaign.notes && (
                        <div className="campaign-table-notes">{campaign.notes}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="campaign-brand-name">{campaign.brand}</span>
                </td>
                <td>
                  <div className="campaign-period">
                    <span>{formatDate(campaign.startDate)}</span>
                    {campaign.endDate && (
                      <>
                        <span className="period-separator">→</span>
                        <span>{formatDate(campaign.endDate)}</span>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </td>
                <td>
                  <span className="campaign-earnings">{formatCurrency(campaign.earnings)}</span>
                </td>
                <td>
                  <span className={campaign.paid ? 'payment-badge paid' : 'payment-badge pending'}>
                    {campaign.paid ? 'In Trust' : 'Available'}
                  </span>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

