'use client';

import { useEffect, useState } from 'react';
import {
  getCurrentTutorialStep,
  completeTutorialStep,
  skipTutorial,
  shouldShowTutorial,
  goToPreviousStep,
  getPreviousStep,
  permanentlyDismissTutorial,
  type TutorialStep,
} from '@/lib/basketball/tutorial';

export function TutorialOverlay() {
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if tutorial should be shown
    if (shouldShowTutorial()) {
      const step = getCurrentTutorialStep();
      setCurrentStep(step);
      setIsVisible(!!step);
    }
  }, []);

  useEffect(() => {
    if (currentStep?.target) {
      // Find and highlight target element
      const element = document.querySelector(currentStep.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (!currentStep) return;
    
    const progress = completeTutorialStep(currentStep.id);
    
    if (progress.completed) {
      setIsVisible(false);
      setCurrentStep(null);
    } else {
      const nextStep = getCurrentTutorialStep();
      setCurrentStep(nextStep);
    }
  };

  const handleSkip = () => {
    skipTutorial();
    setIsVisible(false);
    setCurrentStep(null);
  };

  const handleBack = () => {
    if (!currentStep) return;
    
    const progress = goToPreviousStep();
    const previousStep = getCurrentTutorialStep();
    setCurrentStep(previousStep);
  };

  const handleDismiss = (permanent: boolean) => {
    if (permanent) {
      permanentlyDismissTutorial();
    } else {
      skipTutorial();
    }
    setIsVisible(false);
    setCurrentStep(null);
  };

  const canGoBack = currentStep ? getPreviousStep(currentStep.id) !== null : false;

  if (!isVisible || !currentStep) return null;

  // Calculate position for tooltip
  const getTooltipPosition = () => {
    if (!targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = currentStep.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn" />
      
      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <div
        className="fixed z-50 max-w-md animate-scaleIn"
        style={tooltipStyle}
      >
        <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 p-6 relative">
          {/* X Button with Dismiss Options */}
          <div className="absolute top-4 right-4">
            <DismissButton onDismiss={handleDismiss} />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 pr-8">
            <h3 className="text-xl font-bold text-white">
              {currentStep.title}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {currentStep.description}
          </p>
          
          {/* Actions */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                canGoBack
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ← Back
            </button>
            
            <div className="flex gap-3">
              {currentStep.skipable && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Skip Tutorial
                </button>
              )}
              {currentStep.action === 'complete' ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finish Tutorial
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Tutorial Progress</span>
              <span>{currentStep.id}</span>
            </div>
          </div>
        </div>
        
        {/* Arrow pointer */}
        {targetElement && (
          <div
            className="absolute w-0 h-0"
            style={{
              ...(currentStep.position === 'top' && {
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'bottom' && {
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'left' && {
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'right' && {
                left: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid #3b82f6',
              }),
            }}
          />
        )}
      </div>
    </>
  );
}

function DismissButton({ onDismiss }: { onDismiss: (permanent: boolean) => void }) {
  const [showOptions, setShowOptions] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = () => {
    onDismiss(dontShowAgain);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
        title="Close tutorial"
      >
        ×
      </button>
      
      {showOptions && (
        <div className="absolute top-8 right-0 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-10 min-w-[240px]">
          <div className="mb-3">
            <label className="flex items-start gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
              <span>Don't show tutorials again (applies to all pages)</span>
            </label>
          </div>
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            Close Tutorial
          </button>
        </div>
      )}
    </div>
  );
}

export function TutorialButton() {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleRestart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('basketball_tutorial_progress');
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleRestart}
      className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
      title="Restart Tutorial"
    >
      📚 Tutorial
    </button>
  );
}

// Page Tutorial Component
export function PageTutorialOverlay({ pageName }: { pageName: string }) {
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    // Import page tutorial functions
    import('@/lib/basketball/tutorial').then(({
      shouldShowPageTutorial,
      getPageTutorialProgress
    }) => {
      if (shouldShowPageTutorial(pageName)) {
        const progress = getPageTutorialProgress(pageName);
        setCurrentStep(progress.currentStep);
        setStepIndex(progress.currentStepIndex);
        setTotalSteps(progress.totalSteps);
        setIsVisible(!!progress.currentStep);
      }
    });
  }, [pageName]);

  useEffect(() => {
    if (currentStep?.target) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
    }
  }, [currentStep]);

  const handleNext = async () => {
    if (!currentStep) return;
    
    const { advancePageTutorial, getPageTutorialProgress } = await import('@/lib/basketball/tutorial');
    const isComplete = advancePageTutorial(pageName);
    
    if (isComplete) {
      setIsVisible(false);
      setCurrentStep(null);
    } else {
      const progress = getPageTutorialProgress(pageName);
      setCurrentStep(progress.currentStep);
      setStepIndex(progress.currentStepIndex);
    }
  };

  const handleSkip = async () => {
    const { skipPageTutorial } = await import('@/lib/basketball/tutorial');
    skipPageTutorial(pageName);
    setIsVisible(false);
    setCurrentStep(null);
  };

  const handleBack = async () => {
    if (stepIndex <= 0) return;
    
    const { getPageTutorialProgress } = await import('@/lib/basketball/tutorial');
    
    // Save previous step index
    if (typeof window !== 'undefined') {
      localStorage.setItem(`basketball_page_tutorial_${pageName}`, (stepIndex - 1).toString());
    }
    
    const progress = getPageTutorialProgress(pageName);
    setCurrentStep(progress.currentStep);
    setStepIndex(progress.currentStepIndex);
  };

  const handleDismiss = async (permanent: boolean) => {
    if (permanent) {
      const { permanentlyDismissTutorial } = await import('@/lib/basketball/tutorial');
      permanentlyDismissTutorial();
    } else {
      const { skipPageTutorial } = await import('@/lib/basketball/tutorial');
      skipPageTutorial(pageName);
    }
    setIsVisible(false);
    setCurrentStep(null);
  };

  if (!isVisible || !currentStep) return null;

  const canGoBack = stepIndex > 0;

  // Calculate position for tooltip
  const getTooltipPosition = () => {
    if (!targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = currentStep.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn" />
      
      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <div
        className="fixed z-50 max-w-md animate-scaleIn"
        style={tooltipStyle}
      >
        <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 p-6 relative">
          {/* X Button with Dismiss Options */}
          <div className="absolute top-4 right-4">
            <DismissButton onDismiss={handleDismiss} />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 pr-8">
            <h3 className="text-xl font-bold text-white">
              {currentStep.title}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {currentStep.description}
          </p>
          
          {/* Actions */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                canGoBack
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              ← Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Skip
              </button>
              {currentStep.action === 'complete' ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finish
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Step {stepIndex + 1} of {totalSteps}</span>
              <span className="text-xs">{pageName} tutorial</span>
            </div>
          </div>
        </div>
        
        {/* Arrow pointer */}
        {targetElement && (
          <div
            className="absolute w-0 h-0"
            style={{
              ...(currentStep.position === 'top' && {
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'bottom' && {
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'left' && {
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '10px solid #3b82f6',
              }),
              ...(currentStep.position === 'right' && {
                left: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid #3b82f6',
              }),
            }}
          />
        )}
      </div>
    </>
  );
}

