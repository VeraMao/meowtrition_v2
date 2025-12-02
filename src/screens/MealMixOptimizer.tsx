import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, X, HelpCircle } from 'lucide-react';
import { CatProfile, FoodItem, FeedingPlan, WeightGoal, FoodPortion, MealSchedule } from '../types';
import { FoodCard } from '../components/FoodCard';
import { ButtonPrimary } from '../components/ButtonPrimary';

interface MealMixOptimizerProps {
  catProfile: CatProfile;
  allFoods: FoodItem[];
  onComplete: (plan: FeedingPlan) => void;
  onBack?: () => void;
  onNavigateToFoodLibrary?: () => void;
  initialSelectedFoodIds?: string[];
}

const getGoalLabel = (goal: WeightGoal, customFactor?: number): string => {
  switch (goal) {
    case 'maintain':
      return 'Maintain Weight';
    case 'lose':
      return 'Weight Loss (-20%)';
    case 'gain':
      return 'Weight Gain (+20%)';
    case 'custom':
      return `Custom (${customFactor || 1.0}x)`;
    default:
      return 'Maintain Weight';
  }
};

const MEAL_COUNT_OPTIONS = [1, 2, 3, 4, 5];

export function MealMixOptimizer({
  catProfile,
  allFoods,
  onComplete,
  onBack,
  onNavigateToFoodLibrary,
  initialSelectedFoodIds = [],
}: MealMixOptimizerProps) {
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(initialSelectedFoodIds);
  const [dryWetRatio, setDryWetRatio] = useState(70); // % dry food
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [dryMealsPerDay, setDryMealsPerDay] = useState<number>(2);
  const [wetMealsPerDay, setWetMealsPerDay] = useState<number>(2);
  const [dryCustomInput, setDryCustomInput] = useState<string>('');
  const [wetCustomInput, setWetCustomInput] = useState<string>('');
  const [activeInfo, setActiveInfo] = useState<'dry' | 'wet' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dryMealInitRef = useRef(false);
  const wetMealInitRef = useRef(false);
  const sliderAutoRef = useRef(false);

  // Get weight goal from the feeding plan (set in previous step)
  const goal = catProfile.feedingPlan?.weightGoal || 'maintain';
  const customFactor = catProfile.feedingPlan?.customFactor || 1.0;

  const targetDailyKcal = catProfile.feedingPlan?.totalCaloriesPerDay || 0;

  const selectedFoods = allFoods.filter((f) => selectedFoodIds.includes(f.id));
  
  // Separate dry and wet foods
  const dryFoods = selectedFoods.filter((f) => f.type === 'dry');
  const wetFoods = selectedFoods.filter((f) => f.type === 'wet');
  const dryFood = dryFoods[0] || null;
  const wetFood = wetFoods[0] || null;
  const hasDryFood = Boolean(dryFood);
  const hasWetFood = Boolean(wetFood);

  const sliderRatio = dryWetRatio / 100;
  const computedDryRatio = hasDryFood
    ? hasWetFood
      ? sliderRatio
      : 1
    : 0;
  const computedWetRatio = hasWetFood
    ? hasDryFood
      ? 1 - computedDryRatio
      : 1
    : 0;

  const dryDailyCalories = targetDailyKcal > 0 ? targetDailyKcal * computedDryRatio : 0;
  const wetDailyCalories = targetDailyKcal > 0 ? targetDailyKcal * computedWetRatio : 0;

  const dryCaloriesPerGram = dryFood?.caloriesPerHundredGrams
    ? dryFood.caloriesPerHundredGrams / 100
    : 0;
  const wetCaloriesPerGram = wetFood?.caloriesPerHundredGrams
    ? wetFood.caloriesPerHundredGrams / 100
    : 0;

  const dailyDryGrams =
    dryCaloriesPerGram > 0 && dryDailyCalories > 0
      ? dryDailyCalories / dryCaloriesPerGram
      : 0;
  const dailyWetGrams =
    wetCaloriesPerGram > 0 && wetDailyCalories > 0
      ? wetDailyCalories / wetCaloriesPerGram
      : 0;

  const totalDailyGrams = dailyDryGrams + dailyWetGrams;
  const dryCaloriesTotal = dryDailyCalories;
  const wetCaloriesTotal = wetDailyCalories;
  const hasValidFoods = hasDryFood || hasWetFood;
  const canCalculatePlan = targetDailyKcal > 0 && hasValidFoods;
  const disableRatioSlider = !hasDryFood || !hasWetFood;

  useEffect(() => {
    if (hasDryFood && !hasWetFood && dryWetRatio !== 100) {
      sliderAutoRef.current = true;
      setDryWetRatio(100);
    } else if (!hasDryFood && hasWetFood && dryWetRatio !== 0) {
      sliderAutoRef.current = true;
      setDryWetRatio(0);
    } else if (hasDryFood && hasWetFood && sliderAutoRef.current) {
      sliderAutoRef.current = false;
      if (dryWetRatio === 0 || dryWetRatio === 100) {
        setDryWetRatio(70);
      }
    }
  }, [hasDryFood, hasWetFood, dryWetRatio]);

  useEffect(() => {
    if (!hasDryFood) {
      dryMealInitRef.current = false;
      setDryMealsPerDay(0);
      setDryCustomInput('');
    } else if (!dryMealInitRef.current) {
      dryMealInitRef.current = true;
      setDryMealsPerDay((prev) => {
        const next = prev === 0 ? 2 : prev;
        if (next <= 5) {
          setDryCustomInput('');
        }
        return next;
      });
    }
  }, [hasDryFood]);

  useEffect(() => {
    if (!hasWetFood) {
      wetMealInitRef.current = false;
      setWetMealsPerDay(0);
      setWetCustomInput('');
    } else if (!wetMealInitRef.current) {
      wetMealInitRef.current = true;
      setWetMealsPerDay((prev) => {
        const next = prev === 0 ? 2 : prev;
        if (next <= 5) {
          setWetCustomInput('');
        }
        return next;
      });
    }
  }, [hasWetFood]);

  const isSaveDisabled =
    selectedFoodIds.length === 0 || !canCalculatePlan;

  const formatDailyText = (value: number, unit: 'g' | 'kcal') => {
    if (!Number.isFinite(value) || value <= 0) {
      return unit === 'g' ? '— g / day' : '— kcal';
    }
    return unit === 'g'
      ? `${Math.round(value)} g / day`
      : `${Math.round(value)} kcal`;
  };

  const handleDryCustomInputChange = (value: string) => {
    setDryCustomInput(value);
    if (value === '') {
      setDryMealsPerDay(0);
      return;
    }
    const numeric = parseInt(value, 10);
    if (!Number.isNaN(numeric) && numeric >= 0 && numeric <= 10) {
      setDryMealsPerDay(numeric);
    }
  };

  const handleWetCustomInputChange = (value: string) => {
    setWetCustomInput(value);
    if (value === '') {
      setWetMealsPerDay(0);
      return;
    }
    const numeric = parseInt(value, 10);
    if (!Number.isNaN(numeric) && numeric >= 0 && numeric <= 10) {
      setWetMealsPerDay(numeric);
    }
  };

  const formatPerMealText = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value >= 1 ? `${Math.round(value)} g per meal` : `${value.toFixed(1)} g per meal`;
  };

  const renderFoodSummary = (
    food: FoodItem | null,
    label: string,
    dailyGramsValue: number,
    dailyCaloriesValue: number,
    mealsPerDayValue: number
  ) => {
    if (!food) return null;
    const perMealText =
      mealsPerDayValue > 0 && dailyGramsValue > 0
        ? formatPerMealText(dailyGramsValue / mealsPerDayValue)
        : null;
    return (
      <div
        key={food.id}
        className="p-4 rounded-2xl border border-gray-100 bg-gray-50"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-gray-900 font-medium">{food.name}</div>
            <div className="text-gray-500 text-sm capitalize">{label}</div>
          </div>
          <div className="text-right text-gray-900 font-semibold">
            {formatDailyText(dailyGramsValue, 'g')}
          </div>
        </div>
        <div className="text-gray-500 text-sm">
          {formatDailyText(dailyCaloriesValue, 'kcal')}
        </div>
        {mealsPerDayValue > 0 && perMealText && (
          <div className="text-gray-500 text-sm mt-2">
            {mealsPerDayValue} meals per day → {perMealText}
          </div>
        )}
        {mealsPerDayValue === 0 && (
          <div className="text-gray-500 text-sm mt-2">No scheduled meals</div>
        )}
      </div>
    );
  };

  const toggleFoodSelection = (foodId: string) => {
    if (selectedFoodIds.includes(foodId)) {
      setSelectedFoodIds(selectedFoodIds.filter((id) => id !== foodId));
    } else {
      setSelectedFoodIds([...selectedFoodIds, foodId]);
    }
  };

  const handleSavePlan = () => {
    if (!canCalculatePlan) {
      return;
    }

    const totalGramsRounded = Math.round(totalDailyGrams);
    const totalCaloriesRounded = Math.round(targetDailyKcal);

    const splitValue = (value: number) => {
      const amValue = Math.round(value / 2);
      const pmValue = Math.round(value - amValue);
      return [amValue, pmValue];
    };

    const [amGrams, pmGrams] = splitValue(totalDailyGrams);
    const [amCalories, pmCalories] = splitValue(targetDailyKcal);

    const amPortions: FoodPortion[] = [];
    const pmPortions: FoodPortion[] = [];

    const pushPortions = (food: FoodItem | null, dailyGramsValue: number, dailyCaloriesValue: number) => {
      if (!food || dailyGramsValue <= 0 || dailyCaloriesValue <= 0) {
        return;
      }
      const [foodAmGrams, foodPmGrams] = splitValue(dailyGramsValue);
      const [foodAmCalories, foodPmCalories] = splitValue(dailyCaloriesValue);
      amPortions.push({
        foodId: food.id,
        grams: Math.round(foodAmGrams),
        calories: Math.round(foodAmCalories),
      });
      pmPortions.push({
        foodId: food.id,
        grams: Math.round(foodPmGrams),
        calories: Math.round(foodPmCalories),
      });
    };

    pushPortions(dryFood, dailyDryGrams, dryDailyCalories);
    pushPortions(wetFood, dailyWetGrams, wetDailyCalories);

    const mealSchedules: MealSchedule[] = [];

    const addMealSchedules = (
      food: FoodItem | null,
      mealsPerDayValue: number,
      dailyGramsValue: number,
      dailyCaloriesValue: number,
      labelPrefix: string
    ) => {
      if (!food || mealsPerDayValue <= 0 || dailyGramsValue <= 0 || dailyCaloriesValue <= 0) {
        return;
      }
      const gramsPerMeal = dailyGramsValue / mealsPerDayValue;
      const caloriesPerMeal = dailyCaloriesValue / mealsPerDayValue;
      for (let i = 0; i < mealsPerDayValue; i += 1) {
        mealSchedules.push({
          time: `${labelPrefix} Meal ${i + 1}`,
          grams: Math.round(gramsPerMeal),
          calories: Math.round(caloriesPerMeal),
          portions: [
            {
              foodId: food.id,
              grams: Math.round(gramsPerMeal),
              calories: Math.round(caloriesPerMeal),
            },
          ],
        });
      }
    };

    addMealSchedules(dryFood, dryMealsPerDay, dailyDryGrams, dryDailyCalories, 'Dry');
    addMealSchedules(wetFood, wetMealsPerDay, dailyWetGrams, wetDailyCalories, 'Wet');

    const plan: FeedingPlan = {
      totalGramsPerDay: totalGramsRounded,
      totalCaloriesPerDay: totalCaloriesRounded,
      amGrams: Math.round(amGrams),
      pmGrams: Math.round(pmGrams),
      foodId: selectedFoodIds[0] || '',
      weightGoal: goal,
      customFactor: goal === 'custom' ? customFactor : undefined,
      mealsPerDay: Math.max(dryMealsPerDay, wetMealsPerDay, 1),
      feedingType: 'scheduled',
      isMixed: hasDryFood && hasWetFood,
      amPortions,
      pmPortions,
      mealSchedules,
    };
    onComplete(plan);
  };

  useEffect(() => {
    if (selectedFoodIds.length === 0 && allFoods.length > 0) {
      const dryFood = allFoods.find((f) => f.type === 'dry');
      const wetFood = allFoods.find((f) => f.type === 'wet');
      const initialIds = [];
      if (dryFood) initialIds.push(dryFood.id);
      if (wetFood) initialIds.push(wetFood.id);
      if (initialIds.length === 0 && allFoods.length > 0) {
        initialIds.push(allFoods[0].id);
      }
      setSelectedFoodIds(initialIds);
    }
  }, [allFoods, selectedFoodIds.length]);

  // Update selected foods when initialSelectedFoodIds changes
  useEffect(() => {
    if (initialSelectedFoodIds.length > 0) {
      setSelectedFoodIds(initialSelectedFoodIds);
    }
  }, [initialSelectedFoodIds]);

  // Scroll to top when component mounts or when returning from food library
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);

  if (showFoodSelector) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[390px] mx-auto bg-white min-h-screen shadow-xl relative">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="flex items-center gap-4 p-4">
              <button
                onClick={() => setShowFoodSelector(false)}
                className="p-2 -ml-2 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-gray-900">Select Foods</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-600">Choose 2-3 foods to mix</p>
            {allFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={() => toggleFoodSelection(food.id)}
                isSelected={selectedFoodIds.includes(food.id)}
              />
            ))}
          </div>

          <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
            <ButtonPrimary
              onClick={() => setShowFoodSelector(false)}
              disabled={selectedFoodIds.length === 0}
            >
              Continue ({selectedFoodIds.length} selected)
            </ButtonPrimary>
          </div>
        </div>
      </div>
    );
  }

  const renderInfoModal = () => {
    if (!activeInfo) return null;
    const isDry = activeInfo === 'dry';
    const title = isDry ? 'Dry food portions' : 'Wet food portions';
    const description = isDry
      ? 'Daily dry portions are split evenly across the selected number of dry meals. If you set 0 meals, we keep the daily total for you.'
      : 'Daily wet portions are split evenly across the selected number of wet meals. If you set 0 meals, we keep the daily total for you.';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-[390px] px-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h4 className="text-gray-900 text-lg mb-2">{title}</h4>
            <p className="text-gray-600 mb-4">{description}</p>
            <button
              onClick={() => setActiveInfo(null)}
              className="w-full py-3 rounded-xl bg-[#F4CDA5] text-[#3B2E25] font-semibold active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 pb-24 overflow-y-auto max-w-[390px] mx-auto relative"
    >
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 p-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <h2 className="text-gray-900">Meal Mix Optimizer</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Selected Foods</h3>
            <button
              onClick={() => {
                if (onNavigateToFoodLibrary) {
                  onNavigateToFoodLibrary();
                } else {
                  setShowFoodSelector(true);
                }
              }}
              className="text-[#FFA76B] flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-2">
            {selectedFoods.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No foods selected</p>
            ) : (
              selectedFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: food.type === 'dry' ? '#FFA76B' : '#5DC2B2' }}
                    />
                    <div>
                      <div className="text-gray-900">{food.name}</div>
                      <div className="text-gray-500 capitalize">{food.type} food</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFoodSelection(food.id)}
                    className="p-1 text-gray-400 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weight Goal Reminder */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-gray-900 mb-4">Dry/Wet Ratio</h3>
          <div className="space-y-2 mb-4 text-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Dry</span>
              <span className="text-gray-900 font-semibold">
                {hasDryFood ? `${Math.round(computedDryRatio * 100)}%` : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wet</span>
              <span className="text-gray-900 font-semibold">
                {hasWetFood ? `${Math.round(computedWetRatio * 100)}%` : '0%'}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dryWetRatio}
            disabled={disableRatioSlider}
            onChange={(e) => setDryWetRatio(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #FFA76B ${dryWetRatio}%, #5DC2B2 ${dryWetRatio}%)`,
            }}
          />
          {disableRatioSlider && (
            <p className="text-sm text-gray-500 mt-2">
              Select both a dry and wet food to adjust the ratio.
            </p>
          )}
          {targetDailyKcal > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Target calories: {Math.round(targetDailyKcal)} kcal / day
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-6">
          {hasDryFood && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Dry food – meals per day</h3>
                <button
                  onClick={() => setActiveInfo('dry')}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 active:scale-95"
                  aria-label="Dry meal info"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {MEAL_COUNT_OPTIONS.map((count) => (
                  <button
                    key={`dry-${count}`}
                    onClick={() => {
                      setDryMealsPerDay(count);
                      setDryCustomInput('');
                    }}
                    className={`px-4 py-2 rounded-xl border transition-all ${
                      dryMealsPerDay === count
                        ? 'bg-[#F4CDA5] border-[#D1A27B] text-[#3B2E25]'
                        : 'bg-gray-50 border-transparent text-gray-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={dryCustomInput}
                    onChange={(e) => handleDryCustomInputChange(e.target.value)}
                    placeholder="..."
                    className="w-16 py-2 rounded-xl border border-gray-200 text-center text-gray-900 focus:border-[#D1A27B] focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">(max 10)</span>
                </div>
              </div>
            </div>
          )}

          {hasWetFood && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Wet food – meals per day</h3>
                <button
                  onClick={() => setActiveInfo('wet')}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 active:scale-95"
                  aria-label="Wet meal info"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {MEAL_COUNT_OPTIONS.map((count) => (
                  <button
                    key={`wet-${count}`}
                    onClick={() => {
                      setWetMealsPerDay(count);
                      setWetCustomInput('');
                    }}
                    className={`px-4 py-2 rounded-xl border transition-all ${
                      wetMealsPerDay === count
                        ? 'bg-[#F4CDA5] border-[#D1A27B] text-[#3B2E25]'
                        : 'bg-gray-50 border-transparent text-gray-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={wetCustomInput}
                    onChange={(e) => handleWetCustomInputChange(e.target.value)}
                    placeholder="..."
                    className="w-16 py-2 rounded-xl border border-gray-200 text-center text-gray-900 focus:border-[#D1A27B] focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">(max 10)</span>
                </div>
              </div>
            </div>
          )}

          {!hasDryFood && !hasWetFood && (
            <p className="text-center text-gray-500">
              Add at least one dry or wet food to configure meal counts.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-gray-900 mb-4">Daily Breakdown</h3>
          <div className="space-y-4">
            {renderFoodSummary(
              dryFood,
              'dry food',
              dailyDryGrams,
              dryCaloriesTotal,
              dryMealsPerDay
            )}
            {renderFoodSummary(
              wetFood,
              'wet food',
              dailyWetGrams,
              wetCaloriesTotal,
              wetMealsPerDay
            )}
            {!hasDryFood && !hasWetFood && (
              <p className="text-center text-gray-500">
                Add a dry or wet food to see the daily breakdown.
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <h4 className="text-gray-900 mb-2">How this works</h4>
          <p className="text-gray-600">
            The optimizer calculates the ideal mix of foods to meet your cat's calorie target
            based on their weight goal. You can adjust the dry/wet ratio and meal split to
            customize the plan.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#F4F4F4] border-t border-gray-200 p-4">
        <ButtonPrimary onClick={handleSavePlan} disabled={isSaveDisabled}>
          Save as Daily Plan
        </ButtonPrimary>
      </div>
      {renderInfoModal()}
    </div>
  );
}
