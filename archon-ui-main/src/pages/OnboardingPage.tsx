import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed framer-motion import
import { Sparkles, Key, Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProviderStep } from '../components/onboarding/ProviderStep';

export const OnboardingPage = (): React.JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleProviderSaved = (): void => {
    setCurrentStep(3);
  };

  const handleProviderSkip = (): void => {
    // Navigate to settings with guidance
    navigate('/settings');
  };

  const handleComplete = (): void => {
    // Mark onboarding as dismissed and navigate to home
    localStorage.setItem('onboardingDismissed', 'true');
    navigate('/');
  };

  // Removed animation variants for performance

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center mb-8 gap-3">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-16 rounded-full ${
                step <= currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div>
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Welcome to Archon
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                Let's get you set up with your AI provider in just a few steps. This will enable intelligent knowledge retrieval and code assistance.
              </p>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="min-w-[200px]"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {/* Step 2: Provider Setup */}
        {currentStep === 2 && (
          <div>
            <Card className="p-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mr-4">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Configure AI Provider
                </h2>
              </div>
              
              <ProviderStep
                onSaved={handleProviderSaved}
                onSkip={handleProviderSkip}
              />
            </Card>
          </div>
        )}

        {/* Step 3: All Set */}
        {currentStep === 3 && (
          <div>
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                All Set!
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                You're ready to start using Archon. Begin by adding knowledge sources through website crawling or document uploads.
              </p>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleComplete}
                className="min-w-[200px]"
              >
                Start Using Archon
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};