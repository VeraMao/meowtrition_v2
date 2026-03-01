import React, { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { CatProfile } from '../types';
import { BottomNav } from '../components/BottomNav';

interface AIInsightsProps {
  catProfile: CatProfile;
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile' | 'ai-insights') => void;
  onNavigateToFeedingCoach: () => void;
}

export function AIInsights({
  catProfile,
  onBack,
  onNavigate,
  onNavigateToFeedingCoach,
}: AIInsightsProps) {
  const [showHealthRiskAnalysis, setShowHealthRiskAnalysis] = useState(false);
  const [isLoadingHealthRisk, setIsLoadingHealthRisk] = useState(false);
  
  // Health Risk Predictor form state
  const [healthRiskAge, setHealthRiskAge] = useState(catProfile.age.toString());
  const [healthRiskBreed, setHealthRiskBreed] = useState(catProfile.breed || '');
  const [healthRiskWeight, setHealthRiskWeight] = useState(catProfile.currentWeight.toString());
  const [healthRiskBCS, setHealthRiskBCS] = useState('5');
  const [healthRiskFeedingPattern, setHealthRiskFeedingPattern] = useState('scheduled');

  const handleHealthRiskAnalysis = async () => {
    setIsLoadingHealthRisk(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowHealthRiskAnalysis(true);
    setIsLoadingHealthRisk(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-foreground">AI Insights</h2>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* AI Feeding Coach Card */}
        <div className="bg-card rounded-2xl p-5 border border-border overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.04) 100%)',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </div>
              <h3 className="text-foreground text-lg font-semibold">AI Feeding Coach</h3>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
            Get personalized feeding adjustments based on your cat's weekly metrics.
          </p>
          
          <button
            onClick={onNavigateToFeedingCoach}
            className="w-full py-3 bg-purple-500 text-white rounded-xl active:scale-[0.98] transition-all font-medium hover:bg-purple-600"
          >
            Start Weekly Check-In
          </button>
        </div>

        {/* Health Risk Predictor Card */}
        <div className="bg-card rounded-2xl p-5 border border-border" style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </div>
              <h3 className="text-foreground text-lg font-semibold">Health Risk Predictor</h3>
            </div>
          </div>

          {!showHealthRiskAnalysis ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm mb-4">
                Based on your inputs, we'll assess potential health risks and provide recommendations.
              </p>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Age (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={healthRiskAge}
                    onChange={(e) => setHealthRiskAge(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Breed</label>
                  <input
                    type="text"
                    value={healthRiskBreed}
                    onChange={(e) => setHealthRiskBreed(e.target.value)}
                    placeholder="e.g., Persian, Siamese"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={healthRiskWeight}
                    onChange={(e) => setHealthRiskWeight(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Body Condition Score (1-9)</label>
                  <select
                    value={healthRiskBCS}
                    onChange={(e) => setHealthRiskBCS(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: 9 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Feeding Pattern</label>
                  <select
                    value={healthRiskFeedingPattern}
                    onChange={(e) => setHealthRiskFeedingPattern(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="free-feed">Free Feed</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleHealthRiskAnalysis}
                disabled={isLoadingHealthRisk}
                className="w-full py-3 bg-blue-500 text-white rounded-xl active:scale-[0.98] transition-all font-medium disabled:opacity-70 hover:bg-blue-600"
              >
                {isLoadingHealthRisk ? 'Analyzing...' : 'Predict Risk'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Risk Assessment Results */}
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold text-sm">Obesity Risk</h4>
                      <p className="text-muted-foreground text-xs mt-1">Moderate</p>
                      <p className="text-muted-foreground text-xs mt-2">Based on weight and body score, monitor food portions closely.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold text-sm">Urinary Risk</h4>
                      <p className="text-muted-foreground text-xs mt-1">Elevated</p>
                      <p className="text-muted-foreground text-xs mt-2">Consider foods with balanced minerals and encourage hydration.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold text-sm">Diabetes Risk</h4>
                      <p className="text-muted-foreground text-xs mt-1">Low</p>
                      <p className="text-muted-foreground text-xs mt-2">Continue monitoring with regular weight checks.</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHealthRiskAnalysis(false)}
                className="w-full py-2 bg-muted text-foreground rounded-lg active:scale-[0.98] transition-all text-sm"
              >
                Adjust Inputs
              </button>
            </div>
          )}
        </div>

        {/* About AI Insights */}
        <div className="bg-background border border-border rounded-2xl p-4">
          <p className="text-muted-foreground text-xs leading-relaxed">
            <strong className="text-foreground">How it works:</strong> These analyses are based on your inputs and established nutritional guidelines. They're designed to inform your decisions with your vet, not replace professional advice.
          </p>
        </div>
      </div>

      <BottomNav currentPage="ai-insights" onNavigate={onNavigate} />
    </div>
  );
}
