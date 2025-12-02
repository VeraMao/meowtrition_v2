import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface NutritionComparison {
  oldCalories: number;
  newCalories: number;
  oldGrams: number;
  newGrams: number;
}

interface PlanUpdateNotificationProps {
  catName: string;
  comparison: NutritionComparison;
  onUpdatePlan: () => void;
  onKeepCurrent: () => void;
}

export function PlanUpdateNotification({
  catName,
  comparison,
  onUpdatePlan,
  onKeepCurrent,
}: PlanUpdateNotificationProps) {
  const calorieChange = comparison.newCalories - comparison.oldCalories;
  const gramsChange = comparison.newGrams - comparison.oldGrams;
  const calorieChangePercent = Math.abs((calorieChange / comparison.oldCalories) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-secondary" />
        </div>

        <h3 className="text-foreground text-center mb-2">
          Update {catName}'s Plan?
        </h3>
        
        <p className="text-muted-foreground text-center mb-6">
          {catName}'s profile has changed. Here's how it affects the feeding plan:
        </p>

        {/* Calories Comparison */}
        <div className="bg-background rounded-xl p-4 mb-4">
          <div className="text-muted-foreground mb-3 flex items-center justify-center gap-2">
            {calorieChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : calorieChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-orange-600" />
            ) : null}
            <span>Daily Calories</span>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-foreground">{Math.round(comparison.oldCalories)}</div>
              <div className="text-muted-foreground">Current</div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            
            <div className="text-center">
              <div className={`${
                calorieChange > 0 ? 'text-green-600' : 
                calorieChange < 0 ? 'text-orange-600' : 
                'text-foreground'
              }`}>
                {Math.round(comparison.newCalories)}
              </div>
              <div className="text-muted-foreground">New</div>
            </div>
          </div>
          
          {calorieChange !== 0 && (
            <div className={`text-center mt-2 ${
              calorieChange > 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {calorieChange > 0 ? '+' : ''}{Math.round(calorieChange)} kcal ({calorieChangePercent.toFixed(1)}%)
            </div>
          )}
        </div>

        {/* Grams Comparison */}
        <div className="bg-background rounded-xl p-4 mb-6">
          <div className="text-muted-foreground mb-3 flex items-center justify-center gap-2">
            <span>Daily Amount</span>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-foreground">{Math.round(comparison.oldGrams)}g</div>
              <div className="text-muted-foreground">Current</div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            
            <div className="text-center">
              <div className={`${
                gramsChange > 0 ? 'text-green-600' : 
                gramsChange < 0 ? 'text-orange-600' : 
                'text-foreground'
              }`}>
                {Math.round(comparison.newGrams)}g
              </div>
              <div className="text-muted-foreground">New</div>
            </div>
          </div>
          
          {gramsChange !== 0 && (
            <div className={`text-center mt-2 ${
              gramsChange > 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {gramsChange > 0 ? '+' : ''}{Math.round(gramsChange)}g per day
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpdatePlan}
            className="w-full py-4 rounded-2xl bg-primary text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Update Plan
          </button>
          <button
            onClick={onKeepCurrent}
            className="w-full py-4 rounded-2xl bg-muted text-foreground transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
}
