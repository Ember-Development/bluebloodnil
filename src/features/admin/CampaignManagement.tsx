import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { Modal } from '../../components/ui/Modal';
import './admin.css';
import type { Brand, Campaign, CampaignType, EarningsSplitMethod } from './types';

interface Athlete {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizationId: '',
    athleteIds: [] as string[],
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED',
    type: '' as CampaignType | '',
    isOpen: false,
    address: '',
    totalEarnings: '',
    earningsSplitMethod: 'EQUAL' as EarningsSplitMethod,
    athleteEarnings: {} as Record<string, string>,
  });
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  const [assignAthleteIds, setAssignAthleteIds] = useState<string[]>([]);
  const [createTodos, setCreateTodos] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [closingCampaign, setClosingCampaign] = useState<Campaign | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCampaigns();
    fetchBrands();
    fetchAthletes();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get<Campaign[]>('/api/admin/campaigns');
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await apiClient.get<Brand[]>('/api/admin/organizations');
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchAthletes = async () => {
    try {
      const data = await apiClient.get<Athlete[]>('/api/athletes');
      setAthletes(data);
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        totalEarnings: formData.totalEarnings ? parseFloat(formData.totalEarnings) : undefined,
        athleteEarnings: formData.earningsSplitMethod === 'CUSTOM' && formData.totalEarnings
          ? Object.fromEntries(
              Object.entries(formData.athleteEarnings).map(([id, val]) => [id, parseFloat(val) || 0])
            )
          : undefined,
      };
      delete payload.athleteEarnings; // Remove the string version
      if (payload.athleteEarnings) {
        payload.athleteEarnings = Object.fromEntries(
          Object.entries(payload.athleteEarnings).map(([id, val]) => [id, parseFloat(val as string) || 0])
        );
      }
      await apiClient.post('/api/admin/campaigns', payload);
      setShowAddForm(false);
      resetFormData();
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      const payload: any = {
        ...formData,
        totalEarnings: formData.totalEarnings ? parseFloat(formData.totalEarnings) : undefined,
        athleteEarnings: formData.earningsSplitMethod === 'CUSTOM' && formData.totalEarnings
          ? Object.fromEntries(
              Object.entries(formData.athleteEarnings).map(([id, val]) => [id, parseFloat(val) || 0])
            )
          : undefined,
      };
      delete payload.athleteEarnings; // Remove the string version
      if (payload.athleteEarnings) {
        payload.athleteEarnings = Object.fromEntries(
          Object.entries(payload.athleteEarnings).map(([id, val]) => [id, parseFloat(val as string) || 0])
        );
      }
      await apiClient.put(`/api/admin/campaigns/${editingCampaign.id}`, payload);
      setEditingCampaign(null);
      resetFormData();
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to update campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  const handleCloseCampaign = async () => {
    if (!closingCampaign) return;
    try {
      await apiClient.post(`/api/admin/campaigns/${closingCampaign.id}/close`, {});
      setClosingCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to close campaign:', error);
      alert('Failed to close campaign. Please try again.');
    }
  };

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const handleAcceptApplication = async (campaignId: string, participantId: string) => {
    try {
      await apiClient.post(`/api/admin/campaigns/${campaignId}/applications/${participantId}/accept`, {});
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to accept application:', error);
      alert('Failed to accept application. Please try again.');
    }
  };

  const handleDenyApplication = async (campaignId: string, participantId: string) => {
    if (!confirm('Are you sure you want to deny this application? The athlete will be notified.')) return;
    try {
      await apiClient.post(`/api/admin/campaigns/${campaignId}/applications/${participantId}/deny`, {});
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to deny application:', error);
      alert('Failed to deny application. Please try again.');
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      organizationId: '',
      athleteIds: [],
      status: 'DRAFT',
      type: '',
      isOpen: false,
      address: '',
      totalEarnings: '',
      earningsSplitMethod: 'EQUAL',
      athleteEarnings: {},
    });
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      organizationId: campaign.organization.id,
      athleteIds: campaign.participants.map(p => p.athlete.id),
      status: campaign.status,
      type: campaign.type,
      isOpen: campaign.isOpen,
      address: campaign.address || '',
      totalEarnings: campaign.totalEarnings?.toString() || '',
      earningsSplitMethod: campaign.earningsSplitMethod,
      athleteEarnings: campaign.participants.reduce((acc, p) => {
        if (p.earnings) acc[p.athlete.id] = p.earnings.toString();
        return acc;
      }, {} as Record<string, string>),
    });
  };

  const handleAssignAthletes = async (campaignId: string) => {
    try {
      // Assign athletes to campaign
      await apiClient.post(`/api/admin/campaigns/${campaignId}/assign-athletes`, {
        athleteIds: assignAthleteIds,
      });

      // Optionally create todos for assigned athletes
      if (createTodos && assignAthleteIds.length > 0 && todoTitle && todoDueDate) {
        const todoPromises = assignAthleteIds.map((athleteId) =>
          apiClient.post('/api/admin/todos', {
            title: todoTitle,
            description: todoDescription || `Complete tasks for campaign: ${campaigns.find(c => c.id === campaignId)?.title}`,
            athleteId,
            dueDate: todoDueDate,
            priority: todoPriority,
            campaignId,
            assignedBy: 'Admin',
          })
        );
        await Promise.all(todoPromises);
      }

      setShowAssignForm(null);
      setAssignAthleteIds([]);
      setCreateTodos(false);
      setTodoTitle('');
      setTodoDescription('');
      setTodoDueDate('');
      setTodoPriority('medium');
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to assign athletes:', error);
      alert('Failed to assign athletes. Please try again.');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiClient.delete(`/api/admin/campaigns/${id}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  if (loading) {
    return <div className="management-section">Loading campaigns...</div>;
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Campaign Management</h2>
        <button className="btn-add" onClick={() => setShowAddForm(!showAddForm)}>
          + Create Campaign
        </button>
      </div>

      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetFormData();
        }}
        title="Create New Campaign"
        size="large"
      >
        <form onSubmit={handleCreateCampaign}>
          <div className="form-group">
            <label className="form-label">Campaign Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Campaign title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Campaign Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CampaignType })}
              required
            >
              <option value="">Select type...</option>
              <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
              <option value="COMMERCIAL_VIDEO">Commercial Video</option>
              <option value="IN_PERSON_APPEARANCE">In-Person Appearance</option>
              <option value="PRODUCT_ENDORSEMENT">Product Endorsement</option>
              <option value="AUTOGRAPH_SIGNING">Autograph Signing</option>
              <option value="SPEAKING_ENGAGEMENT">Speaking Engagement</option>
              <option value="PHOTO_SHOOT">Photo Shoot</option>
              <option value="PARTNERSHIP">Partnership</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Campaign description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                required
              >
                <option value="">Select brand...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as typeof formData.status })
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              />
              Open Campaign (Athletes can apply)
            </label>
            <small style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginLeft: '24px' }}>
              If checked, athletes will see an "Apply" button on the feed post
            </small>
          </div>
          {formData.type === 'IN_PERSON_APPEARANCE' && (
            <div className="form-group">
              <label className="form-label">Address <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Event address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required={formData.type === 'IN_PERSON_APPEARANCE'}
              />
            </div>
          )}
          <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-line)' }}>
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 600 }}>Earnings</h4>
            <div className="form-group">
              <label className="form-label">Total Earnings (optional)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.totalEarnings}
                onChange={(e) => setFormData({ ...formData, totalEarnings: e.target.value })}
              />
            </div>
            {formData.totalEarnings && (
              <>
                <div className="form-group">
                  <label className="form-label">Split Method</label>
                  <select
                    className="form-select"
                    value={formData.earningsSplitMethod}
                    onChange={(e) => setFormData({ ...formData, earningsSplitMethod: e.target.value as EarningsSplitMethod })}
                  >
                    <option value="EQUAL">Equal Split</option>
                    <option value="CUSTOM">Custom Amounts</option>
                  </select>
                </div>
                {formData.earningsSplitMethod === 'CUSTOM' && formData.athleteIds.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Earnings per Athlete</label>
                    {formData.athleteIds.map((athleteId) => {
                      const athlete = athletes.find(a => a.id === athleteId);
                      return (
                        <div key={athleteId} style={{ marginBottom: 'var(--space-sm)' }}>
                          <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                            {athlete?.name || athleteId}
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={formData.athleteEarnings[athleteId] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              athleteEarnings: {
                                ...formData.athleteEarnings,
                                [athleteId]: e.target.value,
                              },
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Assign Athletes (optional)</label>
            <select
              className="form-select"
              multiple
              size={5}
              value={formData.athleteIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setFormData({ ...formData, athleteIds: selected });
              }}
            >
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Hold Ctrl/Cmd to select multiple athletes
            </small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Create Campaign
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                resetFormData();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <table className="data-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Brand</th>
            <th>Athletes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                No campaigns yet. Create your first campaign above.
              </td>
            </tr>
          ) : (
            campaigns.map((campaign) => {
              const isExpanded = expandedCampaigns.has(campaign.id);
              const pendingApplications = campaign.participants.filter(p => p.status === 'APPLIED');
              const hasApplications = campaign.isOpen && pendingApplications.length > 0;
              
              return (
                <>
                  <tr 
                    key={campaign.id}
                    style={{ 
                      cursor: hasApplications ? 'pointer' : 'default',
                      backgroundColor: isExpanded ? 'rgba(98, 183, 255, 0.05)' : 'transparent'
                    }}
                    onClick={() => hasApplications && toggleCampaignExpansion(campaign.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        {hasApplications && (
                          <span style={{ 
                            fontSize: '0.9rem',
                            color: 'var(--color-accentSoft)',
                            transition: 'transform 0.2s ease'
                          }}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{campaign.title}</div>
                          {campaign.description && (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-muted)',
                                marginTop: '4px',
                              }}
                            >
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {campaign.organization.logoUrl && (
                      <img
                        src={campaign.organization.logoUrl}
                        alt={campaign.organization.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    {campaign.organization.name}
                  </div>
                </td>
                <td>
                  <div>
                    {campaign.participants.length > 0 ? (
                      <div>
                        <div style={{ marginBottom: '4px' }}>
                          {campaign.participants.filter(p => p.status === 'ACCEPTED' || p.status === 'INVITED').length} assigned
                        </div>
                        {campaign.isOpen && campaign.participants.filter(p => p.status === 'APPLIED').length > 0 && (
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--color-warning)',
                            fontWeight: 600
                          }}>
                            {campaign.participants.filter(p => p.status === 'APPLIED').length} pending application
                            {campaign.participants.filter(p => p.status === 'APPLIED').length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-muted)' }}>No athletes assigned</span>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      background:
                        campaign.status === 'ACTIVE'
                          ? 'rgba(93, 211, 158, 0.2)'
                          : campaign.status === 'COMPLETED'
                            ? 'rgba(98, 183, 255, 0.2)'
                            : campaign.status === 'ARCHIVED'
                              ? 'rgba(148, 163, 184, 0.2)'
                              : 'rgba(246, 196, 83, 0.2)',
                      color:
                        campaign.status === 'ACTIVE'
                          ? 'var(--color-success)'
                          : campaign.status === 'COMPLETED'
                            ? 'var(--color-accentSoft)'
                            : campaign.status === 'ARCHIVED'
                              ? 'var(--color-muted)'
                              : 'var(--color-warning)',
                      border: `1px solid ${
                        campaign.status === 'ACTIVE'
                          ? 'rgba(93, 211, 158, 0.4)'
                          : campaign.status === 'COMPLETED'
                            ? 'rgba(98, 183, 255, 0.4)'
                            : campaign.status === 'ARCHIVED'
                              ? 'rgba(148, 163, 184, 0.4)'
                              : 'rgba(246, 196, 83, 0.4)'
                      }`,
                      textTransform: 'capitalize',
                    }}
                  >
                    {campaign.status.toLowerCase()}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-action"
                      onClick={() => openEditModal(campaign)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-action"
                      onClick={() => {
                        setShowAssignForm(campaign.id);
                        setAssignAthleteIds(campaign.participants.map((p) => p.athlete.id));
                        setCreateTodos(false);
                        setTodoTitle('');
                        setTodoDescription('');
                        setTodoDueDate('');
                        setTodoPriority('medium');
                      }}
                    >
                      Assign Athletes
                    </button>
                    {campaign.status !== 'COMPLETED' && (
                      <button
                        className="btn-action"
                        onClick={() => setClosingCampaign(campaign)}
                      >
                        Close
                      </button>
                    )}
                    <button
                      className="btn-action danger"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              {isExpanded && hasApplications && (
                <tr key={`${campaign.id}-applications`}>
                  <td colSpan={5} style={{ padding: 0, borderTop: 'none' }}>
                    <div style={{
                      padding: 'var(--space-lg)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderTop: '1px solid var(--color-line)',
                    }}>
                      <div style={{ 
                        marginBottom: 'var(--space-md)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text)'
                      }}>
                        Pending Applications ({pendingApplications.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {pendingApplications.map((participant) => (
                          <div
                            key={participant.id}
                            style={{
                              padding: 'var(--space-md)',
                              border: '1px solid var(--color-line)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.03)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                              {participant.athlete.avatarUrl && (
                                <img
                                  src={participant.athlete.avatarUrl}
                                  alt={participant.athlete.name}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              )}
                              <div>
                                <Link
                                  to={`/athletes/${participant.athlete.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    fontWeight: 600,
                                    color: 'var(--color-accentSoft)',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                  }}
                                >
                                  {participant.athlete.name}
                                </Link>
                                {participant.appliedAt && (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                                    Applied {new Date(participant.appliedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                              <button
                                className="btn-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptApplication(campaign.id, participant.id);
                                }}
                                style={{ background: 'rgba(93, 211, 158, 0.2)', color: 'var(--color-success)' }}
                              >
                                Accept
                              </button>
                              <button
                                className="btn-action danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDenyApplication(campaign.id, participant.id);
                                }}
                              >
                                Deny
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
            );
            })
          )}
        </tbody>
      </table>

      <Modal
        isOpen={!!showAssignForm}
        onClose={() => {
          setShowAssignForm(null);
          setAssignAthleteIds([]);
          setCreateTodos(false);
          setTodoTitle('');
          setTodoDescription('');
          setTodoDueDate('');
          setTodoPriority('medium');
        }}
        title={`Assign Athletes to Campaign: ${campaigns.find(c => c.id === showAssignForm)?.title || ''}`}
        size="large"
      >
        <div className="form-group">
          <label className="form-label">Select Athletes</label>
          <select
            className="form-select"
            multiple
            size={6}
            value={assignAthleteIds}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setAssignAthleteIds(selected);
            }}
          >
            {athletes.map((athlete) => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.name}
              </option>
            ))}
          </select>
          <small style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
            Hold Ctrl/Cmd to select multiple athletes
          </small>
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <input
              type="checkbox"
              checked={createTodos}
              onChange={(e) => setCreateTodos(e.target.checked)}
            />
            Create todos for assigned athletes
          </label>
        </div>
        {createTodos && (
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-line)' }}>
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 600 }}>Todo Details</h4>
            <div className="form-group">
              <label className="form-label">Todo Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Submit campaign content"
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Todo Description</label>
              <textarea
                className="form-textarea"
                placeholder="Optional description..."
                value={todoDescription}
                onChange={(e) => setTodoDescription(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value as typeof todoPriority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="form-actions">
          <button
            className="btn-submit"
            onClick={() => showAssignForm && handleAssignAthletes(showAssignForm)}
            disabled={assignAthleteIds.length === 0 || (createTodos && (!todoTitle || !todoDueDate))}
          >
            Assign Athletes
          </button>
          <button
            className="btn-cancel"
            onClick={() => {
              setShowAssignForm(null);
              setAssignAthleteIds([]);
              setCreateTodos(false);
              setTodoTitle('');
              setTodoDescription('');
              setTodoDueDate('');
              setTodoPriority('medium');
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={!!editingCampaign}
        onClose={() => {
          setEditingCampaign(null);
          resetFormData();
        }}
        title={`Edit Campaign: ${editingCampaign?.title || ''}`}
        size="large"
      >
        <form onSubmit={handleUpdateCampaign}>
          <div className="form-group">
            <label className="form-label">Campaign Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Campaign title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Campaign Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CampaignType })}
              required
            >
              <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
              <option value="COMMERCIAL_VIDEO">Commercial Video</option>
              <option value="IN_PERSON_APPEARANCE">In-Person Appearance</option>
              <option value="PRODUCT_ENDORSEMENT">Product Endorsement</option>
              <option value="AUTOGRAPH_SIGNING">Autograph Signing</option>
              <option value="SPEAKING_ENGAGEMENT">Speaking Engagement</option>
              <option value="PHOTO_SHOOT">Photo Shoot</option>
              <option value="PARTNERSHIP">Partnership</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Campaign description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                required
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as typeof formData.status })
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              />
              Open Campaign (Athletes can apply)
            </label>
          </div>
          {formData.type === 'IN_PERSON_APPEARANCE' && (
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Event address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required={formData.type === 'IN_PERSON_APPEARANCE'}
              />
            </div>
          )}
          <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-line)' }}>
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', fontWeight: 600 }}>Earnings</h4>
            <div className="form-group">
              <label className="form-label">Total Earnings (optional)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.totalEarnings}
                onChange={(e) => setFormData({ ...formData, totalEarnings: e.target.value })}
              />
            </div>
            {formData.totalEarnings && (
              <>
                <div className="form-group">
                  <label className="form-label">Split Method</label>
                  <select
                    className="form-select"
                    value={formData.earningsSplitMethod}
                    onChange={(e) => setFormData({ ...formData, earningsSplitMethod: e.target.value as EarningsSplitMethod })}
                  >
                    <option value="EQUAL">Equal Split</option>
                    <option value="CUSTOM">Custom Amounts</option>
                  </select>
                </div>
                {formData.earningsSplitMethod === 'CUSTOM' && formData.athleteIds.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Earnings per Athlete</label>
                    {formData.athleteIds.map((athleteId) => {
                      const athlete = athletes.find(a => a.id === athleteId);
                      return (
                        <div key={athleteId} style={{ marginBottom: 'var(--space-sm)' }}>
                          <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                            {athlete?.name || athleteId}
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={formData.athleteEarnings[athleteId] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              athleteEarnings: {
                                ...formData.athleteEarnings,
                                [athleteId]: e.target.value,
                              },
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Assign Athletes (optional)</label>
            <select
              className="form-select"
              multiple
              size={5}
              value={formData.athleteIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setFormData({ ...formData, athleteIds: selected });
              }}
            >
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Hold Ctrl/Cmd to select multiple athletes
            </small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Update Campaign
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingCampaign(null);
                resetFormData();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Campaign Modal */}
      <Modal
        isOpen={!!closingCampaign}
        onClose={() => setClosingCampaign(null)}
        title={`Close Campaign: ${closingCampaign?.title || ''}`}
        size="medium"
      >
        <div>
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Closing this campaign will:
          </p>
          <ul style={{ marginBottom: 'var(--space-md)', paddingLeft: 'var(--space-lg)' }}>
            <li>Change status to COMPLETED</li>
            <li>Create a recap feed post with verification content and earnings data</li>
            <li>This action cannot be undone</li>
          </ul>
          <div className="form-actions">
            <button
              className="btn-submit"
              onClick={handleCloseCampaign}
            >
              Close Campaign
            </button>
            <button
              className="btn-cancel"
              onClick={() => setClosingCampaign(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

