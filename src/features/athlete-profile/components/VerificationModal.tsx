import { useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import './VerificationModal.css';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: {
    id: string;
    title: string;
    verificationType: 'SOCIAL_POST' | 'IN_PERSON_EVENT' | 'COMMERCIAL_VIDEO' | 'OTHER' | null | undefined;
  };
  onSuccess: () => void;
}

type VerificationStep = 'intro' | 'input' | 'review' | 'success';

export function VerificationModal({ isOpen, onClose, todo, onSuccess }: VerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('intro');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [location, setLocation] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentStep('intro');
    setVerificationUrl('');
    setVerificationNotes('');
    setLocation('');
    setEventTime('');
    setContactName('');
    setContactInfo('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getVerificationTypeInfo = () => {
    switch (todo.verificationType) {
      case 'SOCIAL_POST':
        return {
          title: 'Social Post Verification',
          icon: '📱',
          description: 'Share the link to your social media post',
          examples: [
            'Instagram: https://instagram.com/p/ABC123xyz/',
            'Twitter/X: https://twitter.com/username/status/123456',
            'TikTok: https://tiktok.com/@username/video/123456',
          ],
          placeholder: 'https://instagram.com/p/... or https://twitter.com/...',
          helpText: 'Copy the link directly from your post. Make sure the post is public so we can verify it.',
        };
      case 'IN_PERSON_EVENT':
        return {
          title: 'Event Check-in Verification',
          icon: '📍',
          description: 'Confirm your attendance at the event',
          examples: [],
          placeholder: 'Optional: Link to photo, receipt, or confirmation',
          helpText: 'Provide details about the event and any proof of attendance (photos, receipts, etc.)',
        };
      case 'COMMERCIAL_VIDEO':
        return {
          title: 'Commercial Video Verification',
          icon: '🎬',
          description: 'Share the link to your commercial video',
          examples: [
            'YouTube: https://youtube.com/watch?v=ABC123',
            'Vimeo: https://vimeo.com/123456789',
            'Other: Any video hosting platform link',
          ],
          placeholder: 'https://youtube.com/watch?v=... or https://vimeo.com/...',
          helpText: 'Share the public link to your commercial video. Make sure it\'s accessible for review.',
        };
      case 'OTHER':
        return {
          title: 'Verification Submission',
          icon: '✅',
          description: 'Provide proof of completion',
          examples: [],
          placeholder: 'https://... or any verification link',
          helpText: 'Share any link or document that proves you completed this task.',
        };
      default:
        return {
          title: 'Verification',
          icon: '✓',
          description: 'Provide verification',
          examples: [],
          placeholder: 'https://...',
          helpText: 'Share a link or provide details',
        };
    }
  };

  const typeInfo = getVerificationTypeInfo();

  const validateInput = () => {
    if (todo.verificationType === 'IN_PERSON_EVENT') {
      // For events, require either notes or URL
      if (!verificationNotes.trim() && !verificationUrl.trim()) {
        setError('Please provide event details or a verification link');
        return false;
      }
    } else {
      // For other types, require URL
      if (!verificationUrl.trim()) {
        setError('Please provide a verification link');
        return false;
      }
      // Basic URL validation
      try {
        new URL(verificationUrl);
      } catch {
        setError('Please enter a valid URL (must start with http:// or https://)');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('input');
    } else if (currentStep === 'input') {
      if (validateInput()) {
        setCurrentStep('review');
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('input');
    } else if (currentStep === 'input') {
      setCurrentStep('intro');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // For in-person events, combine location/time/contact into notes if provided
      let finalNotes = verificationNotes;
      if (todo.verificationType === 'IN_PERSON_EVENT') {
        const eventDetails = [];
        if (location) eventDetails.push(`Location: ${location}`);
        if (eventTime) eventDetails.push(`Time: ${eventTime}`);
        if (contactName) eventDetails.push(`Contact: ${contactName}`);
        if (contactInfo) eventDetails.push(`Contact Info: ${contactInfo}`);
        if (verificationNotes) eventDetails.push(`Notes: ${verificationNotes}`);
        
        if (eventDetails.length > 0) {
          finalNotes = eventDetails.join('\n');
        }
      }

      await apiClient.post(`/api/athletes/me/todos/${todo.id}/verify`, {
        verificationUrl: verificationUrl || undefined,
        verificationNotes: finalNotes || undefined,
      });

      setCurrentStep('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to verify todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verification-modal-overlay" onClick={handleClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="verification-modal-close" onClick={handleClose} aria-label="Close">
          ×
        </button>

        {/* Progress Indicator */}
        <div className="verification-progress">
          <div className={`progress-step ${currentStep === 'intro' ? 'active' : currentStep !== 'intro' ? 'completed' : ''}`}>
            <div className="progress-step-number">1</div>
            <div className="progress-step-label">Overview</div>
          </div>
          <div className={`progress-step ${currentStep === 'input' ? 'active' : currentStep === 'review' || currentStep === 'success' ? 'completed' : ''}`}>
            <div className="progress-step-number">2</div>
            <div className="progress-step-label">Details</div>
          </div>
          <div className={`progress-step ${currentStep === 'review' ? 'active' : currentStep === 'success' ? 'completed' : ''}`}>
            <div className="progress-step-number">3</div>
            <div className="progress-step-label">Review</div>
          </div>
        </div>

        {/* Step 1: Intro */}
        {currentStep === 'intro' && (
          <div className="verification-step">
            <div className="verification-step-header">
              <div className="verification-icon">{typeInfo.icon}</div>
              <h2 className="verification-title">{typeInfo.title}</h2>
              <p className="verification-description">{typeInfo.description}</p>
            </div>

            <div className="verification-info-box">
              <h3 className="info-box-title">What you'll need:</h3>
              <ul className="info-box-list">
                {todo.verificationType === 'SOCIAL_POST' && (
                  <>
                    <li>Your social media post (Instagram, Twitter, TikTok, etc.)</li>
                    <li>The public link to your post</li>
                    <li>Make sure the post is set to public</li>
                  </>
                )}
                {todo.verificationType === 'IN_PERSON_EVENT' && (
                  <>
                    <li>Event location and time</li>
                    <li>Contact person name (if applicable)</li>
                    <li>Optional: Photo, receipt, or confirmation document</li>
                  </>
                )}
                {todo.verificationType === 'COMMERCIAL_VIDEO' && (
                  <>
                    <li>Your published commercial video</li>
                    <li>The public link to the video</li>
                    <li>Make sure the video is accessible</li>
                  </>
                )}
                {todo.verificationType === 'OTHER' && (
                  <>
                    <li>Any proof of completion</li>
                    <li>Link to document, photo, or other verification</li>
                  </>
                )}
              </ul>
            </div>

            {typeInfo.examples.length > 0 && (
              <div className="verification-examples">
                <h3 className="examples-title">Example links:</h3>
                <div className="examples-list">
                  {typeInfo.examples.map((example, idx) => (
                    <div key={idx} className="example-item">
                      <code>{example}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="verification-step-actions">
              <button className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleNext}>
                Get Started →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Input */}
        {currentStep === 'input' && (
          <div className="verification-step">
            <div className="verification-step-header">
              <h2 className="verification-title">Provide Verification Details</h2>
              <p className="verification-description">{typeInfo.helpText}</p>
            </div>

            {error && (
              <div className="verification-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="verification-form">
              {todo.verificationType !== 'IN_PERSON_EVENT' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Verification Link <span className="required">*</span>
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder={typeInfo.placeholder}
                      value={verificationUrl}
                      onChange={(e) => {
                        setVerificationUrl(e.target.value);
                        setError(null);
                      }}
                      disabled={isSubmitting}
                    />
                    <small className="form-hint">Paste the complete URL here</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Add any additional context or information..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      Event Location <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Nike Store, 123 Main St, Houston, TX"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Event Time</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 2:00 PM - 4:00 PM"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Contact Person Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., John Smith (Store Manager)"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Info</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Phone or email"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verification Link (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Link to photo, receipt, or confirmation document"
                      value={verificationUrl}
                      onChange={(e) => {
                        setVerificationUrl(e.target.value);
                        setError(null);
                      }}
                      disabled={isSubmitting}
                    />
                    <small className="form-hint">Optional: Share a link to photos, receipts, or confirmation documents</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Additional Details <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe your attendance, what happened, who you met, etc."
                      value={verificationNotes}
                      onChange={(e) => {
                        setVerificationNotes(e.target.value);
                        setError(null);
                      }}
                      disabled={isSubmitting}
                      rows={4}
                      required
                    />
                    <small className="form-hint">Provide details about your attendance at the event</small>
                  </div>
                </>
              )}
            </div>

            <div className="verification-step-actions">
              <button className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                ← Back
              </button>
              <button className="btn-primary" onClick={handleNext} disabled={isSubmitting}>
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <div className="verification-step">
            <div className="verification-step-header">
              <h2 className="verification-title">Review Your Submission</h2>
              <p className="verification-description">Please review your verification details before submitting</p>
            </div>

            <div className="verification-review">
              <div className="review-section">
                <h3 className="review-section-title">Task</h3>
                <p className="review-value">{todo.title}</p>
              </div>

              {verificationUrl && (
                <div className="review-section">
                  <h3 className="review-section-title">Verification Link</h3>
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="review-link"
                  >
                    {verificationUrl}
                  </a>
                </div>
              )}

              {todo.verificationType === 'IN_PERSON_EVENT' && (
                <>
                  {location && (
                    <div className="review-section">
                      <h3 className="review-section-title">Location</h3>
                      <p className="review-value">{location}</p>
                    </div>
                  )}
                  {eventTime && (
                    <div className="review-section">
                      <h3 className="review-section-title">Time</h3>
                      <p className="review-value">{eventTime}</p>
                    </div>
                  )}
                  {contactName && (
                    <div className="review-section">
                      <h3 className="review-section-title">Contact Person</h3>
                      <p className="review-value">{contactName}</p>
                      {contactInfo && <p className="review-value-small">{contactInfo}</p>}
                    </div>
                  )}
                </>
              )}

              {verificationNotes && (
                <div className="review-section">
                  <h3 className="review-section-title">Additional Details</h3>
                  <p className="review-value review-text">{verificationNotes}</p>
                </div>
              )}
            </div>

            <div className="verification-step-actions">
              <button className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                ← Edit
              </button>
              <button
                className="btn-primary btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Verification'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <div className="verification-step verification-success">
            <div className="success-icon">✓</div>
            <h2 className="verification-title">Verification Submitted!</h2>
            <p className="verification-description">
              Your verification has been submitted successfully. The task has been marked as completed.
            </p>
            <div className="success-message">
              <p>You can close this window. The admin will review your submission.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

