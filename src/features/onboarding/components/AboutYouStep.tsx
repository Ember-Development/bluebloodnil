import { useState } from 'react';
import type { OnboardingFormData, InterestInput } from '../types';
import './AboutYouStep.css';

interface AboutYouStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PREDEFINED_INTERESTS: InterestInput[] = [
  { label: 'Photography', color: '#d4a373' },
  { label: 'Strength Training', color: '#e9c46a' },
  { label: 'Travel Ball Tournaments', color: '#2a9d8f' },
  { label: 'Content Creation', color: '#e76f51' },
  { label: 'Gaming', color: '#264653' },
  { label: 'Faith & Family Time', color: '#f4a261' },
  { label: 'Cooking', color: '#e63946' },
  { label: 'Music', color: '#7209b7' },
  { label: 'Fashion', color: '#fb8500' },
  { label: 'Fitness', color: '#06a77d' },
  { label: 'Travel', color: '#118ab2' },
  { label: 'Art', color: '#ef476f' },
];

export function AboutYouStep({ formData, onUpdate, onNext, onBack }: AboutYouStepProps) {
  const [interests, setInterests] = useState<InterestInput[]>(formData.interests || []);
  const [customInterest, setCustomInterest] = useState('');

  const handleToggleInterest = (interest: InterestInput) => {
    const isSelected = interests.some((i) => i.label === interest.label);
    if (isSelected) {
      setInterests(interests.filter((i) => i.label !== interest.label));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim()) {
      setInterests([...interests, { label: customInterest.trim() }]);
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (label: string) => {
    setInterests(interests.filter((i) => i.label !== label));
  };

  const handleNext = () => {
    onUpdate({ interests });
    onNext();
  };

  return (
    <div className="onboarding-step about-you-step">
      <div className="step-header">
        <h2>About You</h2>
        <p>Select your interests to help brands understand what you're passionate about.</p>
      </div>

      <div className="step-form">
        <div className="interests-grid">
          {PREDEFINED_INTERESTS.map((interest) => {
            const isSelected = interests.some((i) => i.label === interest.label);
            return (
              <button
                key={interest.label}
                className={`interest-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleInterest(interest)}
                style={{
                  borderColor: isSelected ? interest.color : undefined,
                  backgroundColor: isSelected ? `${interest.color}20` : undefined,
                }}
              >
                {interest.label}
              </button>
            );
          })}
        </div>

        <div className="custom-interest-section">
          <label>Add Custom Interest</label>
          <div className="custom-interest-input">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
              placeholder="Type an interest and press Enter"
            />
            <button className="btn-add" onClick={handleAddCustomInterest}>
              Add
            </button>
          </div>
        </div>

        {interests.length > 0 && (
          <div className="selected-interests">
            <h3>Selected Interests</h3>
            <div className="selected-interests-list">
              {interests.map((interest) => (
                <span key={interest.label} className="selected-interest-tag">
                  {interest.label}
                  <button
                    className="remove-tag"
                    onClick={() => handleRemoveInterest(interest.label)}
                    aria-label={`Remove ${interest.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

