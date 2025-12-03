import { STEPS, type OnboardingStep } from '../types';
import './StepperProgress.css';

interface StepperProgressProps {
  currentStep: OnboardingStep;
}

export function StepperProgress({ currentStep }: StepperProgressProps) {
  return (
    <div className="stepper-progress">
      <div className="stepper-progress-container">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const stepNumber = index + 1;

          return (
            <div key={step.id} className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="stepper-step-circle">
                {isCompleted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <span className="stepper-step-number">{stepNumber}</span>
                )}
              </div>
              <div className="stepper-step-content">
                <span className="stepper-step-title">{step.title}</span>
                <span className="stepper-step-description">{step.description}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`stepper-step-connector ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

