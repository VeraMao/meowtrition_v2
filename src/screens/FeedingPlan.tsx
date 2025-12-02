import React, { useState, useEffect } from 'react';
import { ChevronLeft, Blend, Info, HelpCircle, ChevronDown } from 'lucide-react';
import { CatProfile, FoodItem, FeedingPlan as FeedingPlanType, WeightGoal } from '../types';
import { calculateMER, calculateDailyFoodAmount, calculateTargetCalories, calculateTreatAllowance, distributeMealsEvenly, getBodyConditionLabel, inferWeightGoal, getActivityFactor, calculateRER } from '../utils/calculations';
import { ButtonPrimary } from '../components/ButtonPrimary';

interface FeedingPlanProps {
  catProfile: CatProfile;
  selectedFood: FoodItem;
  onComplete: (plan: FeedingPlanType) => void;
  onBack?: () => void;
  onMixMeal?: () => void;
}

export function FeedingPlan({
  catProfile,
  selectedFood,
  onComplete,
  onBack,
  onMixMeal,
}: FeedingPlanProps) {
  // Initialize weight goal intelligently
  const [weightGoal, setWeightGoal] = useState<WeightGoal>(() => {
    // If editing existing plan, preserve previous selection
    if (catProfile.feedingPlan?.weightGoal) {
      return catProfile.feedingPlan.weightGoal;
    }
    // Otherwise infer from profile weights
    return inferWeightGoal(catProfile.currentWeight, catProfile.targetWeight);
  });

  const [customFactor, setCustomFactor] = useState<number>(
    catProfile.feedingPlan?.customFactor ?? 1.0
  );

  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [feedingType, setFeedingType] = useState<'scheduled' | 'free'>('scheduled');
  const [showWeightGoalInfo, setShowWeightGoalInfo] = useState(false);
  const [showMealFrequencyInfo, setShowMealFrequencyInfo] = useState(false);
  const [showCalculationBreakdown, setShowCalculationBreakdown] = useState(false);

  const mer = calculateMER(catProfile);
  const targetCalories = calculateTargetCalories(mer, weightGoal, customFactor);
  const dailyGrams = calculateDailyFoodAmount(
    targetCalories,
    selectedFood.caloriesPerHundredGrams
  );
  const treatAllowance = calculateTreatAllowance(targetCalories, weightGoal);

  const [amPortion, setAmPortion] = useState(50);
  const [pmPortion, setPmPortion] = useState(50);

  const amGrams = Math.round((dailyGrams * amPortion) / 100);
  const pmGrams = Math.round((dailyGrams * pmPortion) / 100);

  useEffect(() => {
    setPmPortion(100 - amPortion);
  }, [amPortion]);

  const handleSavePlan = () => {
    const mealSchedules = distributeMealsEvenly(dailyGrams, targetCalories, mealsPerDay).map((meal, idx) => ({
      time: idx === 0 ? '08:00' : idx === 1 ? '18:00' : `${8 + idx * 3}:00`,
      grams: Math.round(meal.grams),
      calories: Math.round(meal.calories),
    }));

    const plan: FeedingPlanType = {
      totalGramsPerDay: Math.round(dailyGrams),
      totalCaloriesPerDay: Math.round(targetCalories),
      amGrams,
      pmGrams,
      foodId: selectedFood.id,
      weightGoal,
      customFactor: weightGoal === 'custom' ? customFactor : undefined,
      mealsPerDay,
      feedingType,
      mealSchedules,
      treatAllowanceCalories: Math.round(treatAllowance),
    };
    onComplete(plan);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b" style={{ borderColor: 'rgba(59, 46, 37, 0.1)' }}>
        <div className="flex items-center gap-4 p-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-[#3B2E25]" />
            </button>
          )}
          <h2 className="text-[#3B2E25]">Feeding Plan</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Weight Goal Section */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(59, 46, 37, 0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#3B2E25]">Weight Goal</h3>
            <button
              onClick={() => setShowWeightGoalInfo(true)}
              className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
            >
              <HelpCircle className="w-5 h-5 text-[#D1A27B]" />
            </button>
          </div>

          {catProfile.targetWeight && (
            <div className="mb-4 p-3 rounded-xl bg-[#F4E9DB]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#6E5C50] text-sm">Your Target Weight</div>
                  <div className="text-[#3B2E25]">{catProfile.targetWeight.toFixed(1)} kg</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#D1A27B] font-semibold">Recommended</div>
                  <div className="text-[#3B2E25] font-semibold">
                    {!catProfile.feedingPlan && (
                      <>
                        {weightGoal === 'lose' && '−20%'}
                        {weightGoal === 'gain' && '+20%'}
                        {weightGoal === 'maintain' && '±0%'}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Body Condition Recommendation */}
          {catProfile.bodyCondition && catProfile.bodyCondition !== 'ideal' && (
            <div className={`mb-4 p-3 rounded-xl border ${
              catProfile.bodyCondition === 'underweight' || catProfile.bodyCondition === 'very-underweight'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  catProfile.bodyCondition === 'underweight' || catProfile.bodyCondition === 'very-underweight'
                    ? 'text-orange-600'
                    : 'text-red-600'
                }`} />
                <div>
                  <div className={`text-sm mb-1 ${
                    catProfile.bodyCondition === 'underweight' || catProfile.bodyCondition === 'very-underweight'
                      ? 'text-orange-800'
                      : 'text-red-800'
                  }`}>
                    <strong>Body Condition: {getBodyConditionLabel(catProfile.bodyCondition)}</strong>
                  </div>
                  <p className={`text-sm ${
                    catProfile.bodyCondition === 'underweight' || catProfile.bodyCondition === 'very-underweight'
                      ? 'text-orange-700'
                      : 'text-red-700'
                  }`}>
                    {catProfile.bodyCondition === 'underweight' || catProfile.bodyCondition === 'very-underweight'
                      ? 'Consider selecting "Gain Weight" to help your cat reach a healthy weight.'
                      : 'Consider selecting "Lose Weight" and consult your veterinarian for a safe weight management plan.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setWeightGoal('maintain')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                weightGoal === 'maintain'
                  ? 'bg-[#F4CDA5] border-2 border-[#D1A27B]'
                  : 'bg-[#E8D8C8] border-2 border-transparent'
              }`}
            >
              <div className="text-[#3B2E25] mb-1">Maintain</div>
              <div className="text-[#6E5C50] text-sm">Keep current weight stable</div>
            </button>

            <button
              onClick={() => setWeightGoal('lose')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                weightGoal === 'lose'
                  ? 'bg-[#F4CDA5] border-2 border-[#D1A27B]'
                  : 'bg-[#E8D8C8] border-2 border-transparent'
              }`}
            >
              <div className="text-[#3B2E25] mb-1">Lose Weight (−20%)</div>
              <div className="text-[#6E5C50] text-sm">Gradual, safe reduction recommended for overweight cats</div>
            </button>

            <button
              onClick={() => setWeightGoal('gain')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                weightGoal === 'gain'
                  ? 'bg-[#F4CDA5] border-2 border-[#D1A27B]'
                  : 'bg-[#E8D8C8] border-2 border-transparent'
              }`}
            >
              <div className="text-[#3B2E25] mb-1">Gain Weight (+20%)</div>
              <div className="text-[#6E5C50] text-sm">For underweight cats only</div>
            </button>

            <button
              onClick={() => setWeightGoal('custom')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                weightGoal === 'custom'
                  ? 'bg-[#F4CDA5] border-2 border-[#D1A27B]'
                  : 'bg-[#E8D8C8] border-2 border-transparent'
              }`}
            >
              <div className="text-[#3B2E25] mb-1">Custom</div>
              <div className="text-[#6E5C50] text-sm">Set your own adjustment factor</div>
            </button>

            {weightGoal === 'custom' && (
              <div className="pt-2">
                <label className="text-[#6E5C50] text-sm mb-2 block">
                  Adjustment Factor (0.5 - 1.5)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={customFactor}
                  onChange={(e) => setCustomFactor(parseFloat(e.target.value) || 1.0)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#E8D8C8] focus:border-[#F4CDA5] outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Daily Recommendation Card */}
        <div className="bg-gradient-to-br from-[#F4CDA5] to-[#D1A27B] rounded-2xl p-6">
          <div className="mb-4">
            <div className="text-[#6E5C50]">Daily Recommendation for {catProfile.name}</div>
            <div className="mt-2">
              <span className="text-5xl text-[#3B2E25]">{Math.round(dailyGrams)}</span>
              <span className="text-2xl ml-2 text-[#3B2E25]">grams</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(59, 46, 37, 0.2)' }}>
            <div>
              <div className="text-[#6E5C50]">Calories</div>
              <div className="text-xl text-[#3B2E25]">{Math.round(targetCalories)} kcal</div>
            </div>
            <div>
              <div className="text-[#6E5C50]">Treats Allowed</div>
              <div className="text-xl text-[#3B2E25]">{treatAllowance} kcal</div>
            </div>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(59, 46, 37, 0.2)' }}>
            <div className="text-[#6E5C50]">Food</div>
            <div className="text-xl text-[#3B2E25]">{selectedFood.name}</div>
          </div>
        </div>

        {/* Feeding Frequency */}
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(59, 46, 37, 0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#3B2E25]">Feeding Frequency</h3>
            <button
              onClick={() => setShowMealFrequencyInfo(true)}
              className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
            >
              <HelpCircle className="w-5 h-5 text-[#D1A27B]" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setFeedingType('scheduled')}
                className={`flex-1 py-3 rounded-xl transition-all ${
                  feedingType === 'scheduled'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setFeedingType('free')}
                className={`flex-1 py-3 rounded-xl transition-all ${
                  feedingType === 'free'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Free Feeding
              </button>
            </div>

            {feedingType === 'scheduled' && (
              <div>
                <label className="text-[#6E5C50] mb-3 block">Meals per day</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMealsPerDay(num)}
                      className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                        mealsPerDay === num
                          ? 'bg-[#F4CDA5] text-[#3B2E25]'
                          : 'bg-[#E8D8C8] text-[#3B2E25]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mealsPerDay > 5 ? mealsPerDay : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= 10) setMealsPerDay(val);
                    }}
                    placeholder="..."
                    className="w-16 py-3 rounded-xl text-center bg-[#E8D8C8] text-[#3B2E25] border-2 border-transparent focus:border-[#F4CDA5] outline-none"
                  />
                </div>

                <div className="mt-4 p-4 rounded-xl bg-[#F4E9DB]">
                  <div className="text-[#3B2E25] mb-2">Portion per meal</div>
                  <div className="space-y-2">
                    {distributeMealsEvenly(dailyGrams, targetCalories, mealsPerDay).map((meal, idx) => (
                      <div key={idx} className="flex justify-between text-[#6E5C50]">
                        <span>Meal {idx + 1}:</span>
                        <span>{meal.grams}g ({meal.calories} kcal)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Traditional 2-Meal Split (for backward compatibility) */}
        {feedingType === 'scheduled' && mealsPerDay === 2 && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(59, 46, 37, 0.05)' }}>
            <h3 className="text-[#3B2E25] mb-4">Meal Split</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#6E5C50]">Morning</span>
                  <span className="text-[#3B2E25]">{Math.round(amGrams)}g ({amPortion}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={amPortion}
                  onChange={(e) => setAmPortion(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#E8D8C8] rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #F4CDA5 ${amPortion}%, #E8D8C8 ${amPortion}%)`,
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#6E5C50]">Evening</span>
                  <span className="text-[#3B2E25]">{Math.round(pmGrams)}g ({pmPortion}%)</span>
                </div>
                <div className="w-full h-2 bg-[#E8D8C8] rounded-lg relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-[#D1A27B] rounded-lg transition-all"
                    style={{ width: `${pmPortion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Breakdown - Collapsible */}
        <div className="bg-[#F4E9DB] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowCalculationBreakdown(!showCalculationBreakdown)}
            className="w-full p-4 flex items-center justify-between text-left active:scale-[0.98] transition-all"
          >
            <h4 className="text-[#3B2E25] font-medium">How this is calculated</h4>
            <ChevronDown
              className={`w-5 h-5 text-[#D1A27B] transition-transform ${
                showCalculationBreakdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showCalculationBreakdown && (
            <div className="px-4 pb-4 text-[#6E5C50] space-y-2 text-sm border-t border-[#D1A27B]/30">
              <p>• RER (Resting Energy Rate): {Math.round(calculateRER(catProfile.currentWeight))} kcal</p>
              <p>• Activity Factor: ×{getActivityFactor(catProfile.activityLevel, catProfile.isNeutered).toFixed(1)}</p>
              <p>• MER (Maintenance Energy Rate): {Math.round(mer)} kcal</p>
              {weightGoal !== 'maintain' && (
                <p>• Weight Goal Adjustment: ×{weightGoal === 'lose' ? '0.8 (−20%)' : weightGoal === 'gain' ? '1.2 (+20%)' : customFactor.toFixed(2)}</p>
              )}
              <p className="pt-2 border-t border-[#D1A27B]/30">• Target Daily Calories: {Math.round(targetCalories)} kcal</p>
              <p>• Food Calories per gram: {(selectedFood.caloriesPerHundredGrams / 100).toFixed(2)} kcal/g</p>
              <p>• Daily Food Amount: {Math.round(dailyGrams)}g</p>
              <p>• Treat Allowance: {treatAllowance} kcal ({weightGoal === 'lose' ? '5%' : '10%'} of daily calories)</p>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <ButtonPrimary onClick={handleSavePlan}>Save Plan</ButtonPrimary>
          {onMixMeal && (
            <button
              onClick={onMixMeal}
              className="w-full py-4 rounded-2xl bg-white border-2 border-[#F4CDA5] text-[#F4CDA5] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Blend className="w-5 h-5" />
              Mix Dry & Wet Food
            </button>
          )}
        </div>
      </div>

      {/* Weight Goal Info Modal */}
      {showWeightGoalInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#3B2E25]">Weight Goal Adjustment</h3>
              <button
                onClick={() => setShowWeightGoalInfo(false)}
                className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-[#6E5C50]" />
              </button>
            </div>
            <div className="space-y-4 text-[#6E5C50]">
              <p>
                The adjustment factor modifies your cat's calculated daily calorie needs based on their weight goal.
              </p>
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Maintain</div>
                <p className="text-sm">Uses the full MER (Maintenance Energy Requirement) calculated for your cat's current weight and activity level.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Lose Weight (-20%)</div>
                <p className="text-sm">Reduces calories by 20% for gradual, safe weight loss. Recommended for overweight cats under veterinary guidance.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Gain Weight (+20%)</div>
                <p className="text-sm">Increases calories by 20% to help underweight cats gain weight safely.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Custom</div>
                <p className="text-sm">Set a custom multiplier (0.5-1.5) for fine-tuned calorie adjustment based on veterinary recommendations.</p>
              </div>
              <p className="text-xs pt-2 border-t border-[#D1A27B]/30">
                Note: This adjustment is separate from your target weight. It modifies daily calorie intake to help reach that target gradually.
              </p>
            </div>
            <button
              onClick={() => setShowWeightGoalInfo(false)}
              className="w-full mt-6 py-3 rounded-xl bg-[#F4CDA5] text-[#3B2E25] active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Meal Frequency Info Modal */}
      {showMealFrequencyInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#3B2E25]">Feeding Types</h3>
              <button
                onClick={() => setShowMealFrequencyInfo(false)}
                className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-[#6E5C50]" />
              </button>
            </div>
            <div className="space-y-4 text-[#6E5C50]">
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Scheduled Feeding</div>
                <p className="text-sm">
                  Feed your cat at specific times throughout the day. Choose 1-5 meals and the system will divide the daily portion evenly.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#3B2E25] mb-1">Free Feeding</div>
                <p className="text-sm">
                  Leave food out all day for your cat to graze. Best for cats that self-regulate and don't overeat.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMealFrequencyInfo(false)}
              className="w-full mt-6 py-3 rounded-xl bg-[#F4CDA5] text-[#3B2E25] active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
