import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { OnboardingFormData } from '../types';
import './BasicInfoStep.css';

interface BasicInfoStepProps {
  formData: OnboardingFormData;
  onUpdate: (data: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

export function BasicInfoStep({ formData, onUpdate, onNext }: BasicInfoStepProps) {
  const { user } = useAuth();
  const [location, setLocation] = useState(formData.location || '');
  const [bio, setBio] = useState(formData.bio || '');
  const [sport, setSport] = useState(formData.sport || '');
  const [primaryPosition, setPrimaryPosition] = useState(formData.primaryPosition || '');
  const [school, setSchool] = useState(formData.school || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const athlete = user?.athlete;

  useEffect(() => {
    // Pre-fill from existing data
    if (athlete) {
      if (!location && athlete.location) setLocation(athlete.location);
      if (!bio && athlete.bio) setBio(athlete.bio);
      if (!sport && athlete.sport) setSport(athlete.sport);
      if (!primaryPosition && athlete.primaryPosition) setPrimaryPosition(athlete.primaryPosition);
      if (!school && athlete.school) setSchool(athlete.school);
    }
  }, [athlete]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!bio.trim()) newErrors.bio = 'Bio is required';
    if (!sport.trim()) newErrors.sport = 'Sport is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onUpdate({ location, bio, sport, primaryPosition, school });
      onNext();
    }
  };

  return (
    <div className="onboarding-step basic-info-step">
      <div className="step-header">
        <h2>Welcome, {athlete?.name || athlete?.firstName || 'Athlete'}!</h2>
        <p>Let's complete your profile with some basic information.</p>
      </div>

      <div className="step-form">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Houston, TX"
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="sport">Sport *</label>
          <input
            id="sport"
            type="text"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="e.g., Softball, Baseball"
            className={errors.sport ? 'error' : ''}
          />
          {errors.sport && <span className="error-message">{errors.sport}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="primaryPosition">Primary Position</label>
          <input
            id="primaryPosition"
            type="text"
            value={primaryPosition}
            onChange={(e) => setPrimaryPosition(e.target.value)}
            placeholder={athlete?.position1 || 'e.g., Shortstop'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="school">School</label>
          <input
            id="school"
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder={athlete?.school || 'e.g., Your High School'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio *</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself, your achievements, and what makes you unique..."
            rows={6}
            className={errors.bio ? 'error' : ''}
          />
          {errors.bio && <span className="error-message">{errors.bio}</span>}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

