import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/apiClient';
import type { ScenarioIdea } from '../../athlete-profile/types';
import './AthleteBrandingModal.css';

interface AthleteBrandingModalProps {
  athleteId: string;
  athleteName: string;
  currentBrandFitSummary?: string;
  currentScenarioIdeas?: ScenarioIdea[];
  onClose: () => void;
  onSave: () => void;
}

export function AthleteBrandingModal({
  athleteId,
  athleteName,
  currentBrandFitSummary = '',
  currentScenarioIdeas = [],
  onClose,
  onSave,
}: AthleteBrandingModalProps) {
  const [brandFitSummary, setBrandFitSummary] = useState(currentBrandFitSummary);
  const [scenarioIdeas, setScenarioIdeas] = useState<ScenarioIdea[]>(currentScenarioIdeas);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state when props change (e.g., when switching between athletes)
  useEffect(() => {
    setBrandFitSummary(currentBrandFitSummary);
    setScenarioIdeas(currentScenarioIdeas);
  }, [currentBrandFitSummary, currentScenarioIdeas]);

  const handleAddScenario = () => {
    setScenarioIdeas([
      ...scenarioIdeas,
      {
        id: `temp-${Date.now()}`,
        title: '',
        goal: '',
        description: '',
        idealBrands: '',
      },
    ]);
  };

  const handleRemoveScenario = (index: number) => {
    setScenarioIdeas(scenarioIdeas.filter((_, i) => i !== index));
  };

  const handleUpdateScenario = (index: number, updates: Partial<ScenarioIdea>) => {
    setScenarioIdeas(
      scenarioIdeas.map((idea, i) => (i === index ? { ...idea, ...updates } : idea))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save brand positioning
      await apiClient.put(`/api/admin/athletes/${athleteId}/brand-positioning`, {
        brandFitSummary,
      });

      // Save scenario ideas (filter out empty ones)
      const validScenarios = scenarioIdeas.filter(
        (s) => s.title.trim() && s.goal.trim() && s.description.trim()
      );

      await apiClient.put(`/api/admin/athletes/${athleteId}/scenario-ideas`, {
        scenarioIdeas: validScenarios,
      });

      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save branding:', err);
      setError(err instanceof Error ? err.message : 'Failed to save branding information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content branding-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Brand Positioning - {athleteName}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <label className="form-label">Brand Fit & Positioning</label>
            <p className="form-help-text">
              Describe how this athlete fits with brands and their positioning in the market.
            </p>
            <textarea
              className="form-textarea"
              value={brandFitSummary}
              onChange={(e) => setBrandFitSummary(e.target.value)}
              placeholder="Perfect fit for softball brands, local training facilities, family-focused restaurants, faith-based orgs, and community partners who want a positive female athlete leading the story."
              rows={6}
            />
          </div>

          <div className="form-section">
            <div className="section-header-inline">
              <div>
                <label className="form-label">How {athleteName} Can Help Your Brand</label>
                <p className="form-help-text">
                  Add scenario ideas showing how brands can work with this athlete.
                </p>
              </div>
              <button className="btn-add-small" onClick={handleAddScenario}>
                + Add Scenario
              </button>
            </div>

            {scenarioIdeas.length === 0 && (
              <div className="empty-state">
                <p>No scenario ideas yet. Click "Add Scenario" to create one.</p>
              </div>
            )}

            {scenarioIdeas.map((scenario, index) => (
              <div key={scenario.id || index} className="scenario-card">
                <div className="scenario-header">
                  <span className="scenario-number">Scenario {index + 1}</span>
                  <button
                    className="btn-remove-small"
                    onClick={() => handleRemoveScenario(index)}
                    aria-label="Remove scenario"
                  >
                    ×
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label-small">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={scenario.title}
                    onChange={(e) => handleUpdateScenario(index, { title: e.target.value })}
                    placeholder="e.g., Launch a new bat or glove line"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Goal</label>
                  <input
                    type="text"
                    className="form-input"
                    value={scenario.goal}
                    onChange={(e) => handleUpdateScenario(index, { goal: e.target.value })}
                    placeholder="e.g., Product awareness & try-ons across Texas tournaments"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Description</label>
                  <textarea
                    className="form-textarea-small"
                    value={scenario.description}
                    onChange={(e) => handleUpdateScenario(index, { description: e.target.value })}
                    placeholder="Game-day content using your gear, infield drill breakdowns featuring key tech, and Q&A on why she trusts your brand."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Ideal Brands</label>
                  <input
                    type="text"
                    className="form-input"
                    value={scenario.idealBrands}
                    onChange={(e) => handleUpdateScenario(index, { idealBrands: e.target.value })}
                    placeholder="e.g., Bat & glove brands, performance apparel, cleat companies"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-submit" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

