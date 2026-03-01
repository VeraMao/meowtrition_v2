import React, { useState } from 'react';
import { ChevronLeft, Sparkles, TrendingDown } from 'lucide-react';
import { CatProfile, FeedingPlan } from '../types';

interface AIFeedingCoachProps {
  catProfile: CatProfile;
  currentFeedingPlan: FeedingPlan;
  onBack: () => void;
}

export function AIFeedingCoach({
  catProfile,
  currentFeedingPlan,
  onBack,
}: AIFeedingCoachProps) {
  const [currentWeight, setCurrentWeight] = useState(catProfile.currentWeight.toString());
  const [bodyConditionScore, setBodyConditionScore] = useState('5');
  const [appetite, setAppetite] = useState<'low' | 'normal' | 'high'>('normal');
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeAndAdjust = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowAnalysis(true);
    setIsLoading(false);
  };

  const currentCalories = currentFeedingPlan.totalCaloriesPerDay;
  const adjustmentPercentage = 5; // Hardcoded for mock
  const recommendedCalories = Math.round(currentCalories * (100 - adjustmentPercentage) / 100);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-foreground">AI Feeding Coach</h2>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!showAnalysis ? (
          <>
            {/* Weekly Check-In Card */}
            <div className="bg-card rounded-2xl p-5 border border-border" style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </div>
              <h3 className="text-foreground text-lg font-semibold mb-2">Weekly Check-In</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Help us adjust {catProfile.name}'s feeding plan based on this week's observations.
              </p>

              <div className="space-y-4">
                {/* Current Weight */}
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Body Condition Score Slider */}
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">
                    Body Condition Score: {bodyConditionScore}
                  </label>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground">Thin</span>
                    <input
                      type="range"
                      min="1"
                      max="9"
                      value={bodyConditionScore}
                      onChange={(e) => setBodyConditionScore(e.target.value)}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((parseInt(bodyConditionScore) - 1) / 8) * 100}%, var(--color-border) ${((parseInt(bodyConditionScore) - 1) / 8) * 100}%, var(--color-border) 100%)`
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Overweight</span>
                  </div>
                </div>

                {/* Appetite */}
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Appetite</label>
                  <div className="flex gap-2">
                    {(['low', 'normal', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setAppetite(level)}
                        className={`flex-1 py-2 rounded-lg transition-all capitalize ${
                          appetite === level
                            ? 'bg-primary text-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Activity Level</label>
                  <div className="flex gap-2">
                    {(['low', 'moderate', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setActivityLevel(level)}
                        className={`flex-1 py-2 rounded-lg transition-all capitalize ${
                          activityLevel === level
                            ? 'bg-primary text-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeAndAdjust}
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-500 text-white rounded-xl active:scale-[0.98] transition-all font-medium disabled:opacity-70 hover:bg-purple-600"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze & Adjust'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* AI Analysis Results */}
            <div className="bg-card rounded-2xl p-5 border border-border" style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.04) 100%)',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
            }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </div>
              <h3 className="text-foreground text-lg font-semibold mb-4">AI Feeding Adjustment</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                  <span className="text-foreground font-medium">•</span>
                  <p className="text-muted-foreground text-sm">Weight trend: Slight plateau detected</p>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                  <span className="text-foreground font-medium">•</span>
                  <p className="text-muted-foreground text-sm">Body score indicates mild overweight</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-foreground font-medium">•</span>
                  <p className="text-muted-foreground text-sm">Activity decreased this week</p>
                </div>
              </div>
            </div>

            {/* Recommended Adjustment */}
            <div className="bg-card rounded-2xl p-5 border border-border" style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            }}>
              <h3 className="text-foreground text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-500" />
                Recommended Adjustment
              </h3>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-foreground text-sm font-semibold">
                  Reduce daily intake by {adjustmentPercentage}% (−{currentCalories - recommendedCalories} kcal/day)
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  Based on your inputs, a slight reduction can help maintain healthy weight.
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">New Daily Target</span>
                  <span className="text-foreground font-semibold">{recommendedCalories} kcal/day</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: '75%' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Previous</span>
                  <span className="text-muted-foreground text-xs">{currentCalories} kcal/day</span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                💡 Tip: Spread the reduction across both meals for easier adjustment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowAnalysis(false)}
                className="w-full py-3 bg-muted text-foreground rounded-xl active:scale-[0.98] transition-all font-medium"
              >
                Adjust Inputs
              </button>
              <button
                className="w-full py-3 bg-primary text-foreground rounded-xl active:scale-[0.98] transition-all font-medium hover:bg-primary/90"
              >
                Apply Adjustment to Plan
              </button>
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-xs leading-relaxed">
            <strong className="text-foreground">Suggested adjustments</strong> are based on your inputs and follow established nutritional science. Always consult your vet for major feeding changes.
          </p>
        </div>
      </div>
    </div>
  );
}
