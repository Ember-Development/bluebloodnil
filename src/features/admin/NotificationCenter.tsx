import { useState } from 'react';
import './admin.css';
import { MOCK_ATHLETES } from '../athletes/types';

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Campaign Opportunity',
    message: 'Elite Softball Gear has a new campaign available for athletes.',
    targetAudience: 'athletes',
    sentAt: '2024-04-20T10:30:00Z',
    status: 'sent',
  },
  {
    id: '2',
    title: 'Compliance Webinar Reminder',
    message: 'Reminder: NIL compliance webinar starts in 2 hours.',
    targetAudience: 'all',
    sentAt: '2024-04-19T14:00:00Z',
    status: 'sent',
  },
];

export function NotificationCenter() {
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all' as 'all' | 'athletes' | 'brands' | 'specific',
    targetIds: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
    scheduledFor: '',
  });

  return (
    <div>
      <div className="management-section" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="section-header">
          <h2 className="section-title">Push Notifications</h2>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            + Create Notification
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Target</th>
              <th>Sent At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td style={{ fontWeight: 600 }}>{notification.title}</td>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                  {notification.message}
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      background: 'rgba(98, 183, 255, 0.2)',
                      color: 'var(--color-accentSoft)',
                      border: '1px solid rgba(98, 183, 255, 0.4)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {notification.targetAudience}
                  </span>
                </td>
                <td>{new Date(notification.sentAt).toLocaleString()}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      background: 'rgba(93, 211, 158, 0.2)',
                      color: 'var(--color-success)',
                      border: '1px solid rgba(93, 211, 158, 0.4)',
                    }}
                  >
                    {notification.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Create Notification</h3>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder="Notification message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: e.target.value as 'all' | 'athletes' | 'brands' | 'specific',
                  })
                }
              >
                <option value="all">All Users</option>
                <option value="athletes">Athletes Only</option>
                <option value="brands">Brands Only</option>
                <option value="specific">Specific Users</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {formData.targetAudience === 'specific' && (
            <div className="form-group">
              <label className="form-label">Select Athletes</label>
              <select
                className="form-select"
                multiple
                style={{ minHeight: '120px' }}
                value={formData.targetIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFormData({ ...formData, targetIds: selected });
                }}
              >
                {MOCK_ATHLETES.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                Hold Ctrl/Cmd to select multiple
              </small>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Schedule (Optional)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button className="btn-submit">Send Notification</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

