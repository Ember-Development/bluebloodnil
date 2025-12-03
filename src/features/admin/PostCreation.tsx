import { useState } from 'react';
import './admin.css';
import { MOCK_ATHLETES } from '../athletes/types';

export function PostCreation() {
  const [postType, setPostType] = useState<'athlete_update' | 'campaign' | 'org_announcement' | 'commitment'>('athlete_update');
  const [formData, setFormData] = useState({
    headline: '',
    body: '',
    tags: [] as string[],
    tagInput: '',
    authorId: '',
    mediaUrl: '',
    statLine: '',
    brand: '',
    brandLogoUrl: '',
    objective: '',
    program: '',
    level: 'D1' as const,
  });

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="form-section form-section-full">
      <h2 className="section-title" style={{ marginBottom: 'var(--space-xl)' }}>
        Create Feed Post
      </h2>

      <div className="form-group">
        <label className="form-label">Post Type</label>
        <select
          className="form-select"
          value={postType}
          onChange={(e) => setPostType(e.target.value as any)}
        >
          <option value="athlete_update">Athlete Update</option>
          <option value="campaign">Campaign</option>
          <option value="org_announcement">Organization Announcement</option>
          <option value="commitment">Commitment</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Headline</label>
        <input
          type="text"
          className="form-input"
          placeholder="Post headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Body</label>
        <textarea
          className="form-textarea"
          placeholder="Post content..."
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
      </div>

      {postType === 'athlete_update' && (
        <>
          <div className="form-group">
            <label className="form-label">Athlete</label>
            <select
              className="form-select"
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
            >
              <option value="">Select athlete...</option>
              {MOCK_ATHLETES.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stat Line</label>
              <input
                type="text"
                className="form-input"
                placeholder="3-3, HR, 2B, 3 RBI"
                value={formData.statLine}
                onChange={(e) => setFormData({ ...formData, statLine: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Media URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      {postType === 'campaign' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brand name"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Brand Logo URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={formData.brandLogoUrl}
              onChange={(e) => setFormData({ ...formData, brandLogoUrl: e.target.value })}
            />
          </div>
        </div>
      )}

      {postType === 'campaign' && (
        <div className="form-group">
          <label className="form-label">Objective</label>
          <input
            type="text"
            className="form-input"
            placeholder="Campaign objective"
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          />
        </div>
      )}

      {postType === 'commitment' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Program</label>
            <input
              type="text"
              className="form-input"
              placeholder="Oklahoma State"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <select
              className="form-select"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
            >
              <option value="D1">D1</option>
              <option value="D2">D2</option>
              <option value="NAIA">NAIA</option>
              <option value="JUCO">JUCO</option>
              <option value="HS">HS</option>
              <option value="Club">Club</option>
            </select>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Tags</label>
        <div className="tag-input">
          {formData.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            value={formData.tagInput}
            onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              outline: 'none',
              flex: 1,
              minWidth: '100px',
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleAddTag}
          style={{
            marginTop: 'var(--space-xs)',
            padding: 'var(--space-xs) var(--space-sm)',
            background: 'rgba(98, 183, 255, 0.15)',
            border: '1px solid rgba(98, 183, 255, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-accentSoft)',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Add Tag
        </button>
      </div>

      <div className="form-actions">
        <button className="btn-submit">Publish Post</button>
        <button className="btn-cancel">Save Draft</button>
      </div>
    </div>
  );
}

