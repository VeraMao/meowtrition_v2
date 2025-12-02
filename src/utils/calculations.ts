import { CatProfile, WeightGoal, FoodItem, FoodPortion, BodyCondition, WeightUnit, PortionUnit } from '../types';

export function calculateRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

export function getActivityFactor(
  activityLevel: 'low' | 'medium' | 'high',
  isNeutered: boolean
): number {
  if (activityLevel === 'low') {
    return isNeutered ? 1.2 : 1.4;
  } else if (activityLevel === 'medium') {
    return isNeutered ? 1.4 : 1.6;
  } else {
    return isNeutered ? 1.6 : 2.0;
  }
}

export function calculateMER(profile: CatProfile): number {
  const rer = calculateRER(profile.currentWeight);
  const activityFactor = getActivityFactor(profile.activityLevel, profile.isNeutered);
  return rer * activityFactor;
}

export function calculateDailyFoodAmount(
  mer: number,
  caloriesPerHundredGrams: number
): number {
  const caloriesPerGram = caloriesPerHundredGrams / 100;
  return mer / caloriesPerGram;
}

export function getGoalAdjustmentFactor(goal: WeightGoal, customFactor?: number): number {
  switch (goal) {
    case 'lose':
      return 0.8;
    case 'gain':
      return 1.2;
    case 'custom':
      return customFactor || 1.0;
    case 'maintain':
    default:
      return 1.0;
  }
}

export function calculateTargetCalories(
  mer: number,
  goal: WeightGoal,
  customFactor?: number
): number {
  return mer * getGoalAdjustmentFactor(goal, customFactor);
}

// Calculate calories based on weight goal
// For weight loss: use target weight for MER calculation
// For weight gain: use target weight for MER calculation
// For maintain: use current weight for MER calculation
export function calculateCaloriesForGoal(
  profile: CatProfile,
  weightGoal: WeightGoal,
  customFactor?: number
): number {
  const targetWeight = profile.targetWeight;
  const currentWeight = profile.currentWeight;

  let baseWeight: number;
  if (weightGoal === 'lose' && targetWeight) {
    // For weight loss, calculate MER based on target weight
    baseWeight = targetWeight;
  } else if (weightGoal === 'gain' && targetWeight) {
    // For weight gain, calculate MER based on target weight
    baseWeight = targetWeight;
  } else {
    // For maintain or if no target weight, use current weight
    baseWeight = currentWeight;
  }

  // Calculate MER using base weight
  const rer = calculateRER(baseWeight);
  const activityFactor = getActivityFactor(profile.activityLevel, profile.isNeutered);
  const mer = rer * activityFactor;

  // Apply goal adjustment factor
  return calculateTargetCalories(mer, weightGoal, customFactor);
}

// Calculate target weight based on current weight and weight goal
export function calculateTargetWeight(
  currentWeightKg: number,
  weightGoal: WeightGoal,
  customFactor?: number
): number {
  switch (weightGoal) {
    case 'lose':
      return currentWeightKg * 0.8; // -20%
    case 'gain':
      return currentWeightKg * 1.2; // +20%
    case 'custom':
      // For custom, the factor is applied to calories, not directly to weight
      // We'll approximate: if calories are reduced by X%, weight reduction will be proportional
      // This is a simplification - in reality weight change is more complex
      const factor = customFactor || 1.0;
      if (factor < 1.0) {
        // Reducing calories (weight loss goal)
        return currentWeightKg * factor;
      } else if (factor > 1.0) {
        // Increasing calories (weight gain goal)
        return currentWeightKg * factor;
      }
      return currentWeightKg; // maintain if factor is 1.0
    case 'maintain':
    default:
      return currentWeightKg;
  }
}

// Infer weight goal based on current vs target weight
export function inferWeightGoal(
  currentWeight: number,
  targetWeight?: number
): WeightGoal {
  if (!targetWeight) {
    return 'maintain';
  }

  const ratio = targetWeight / currentWeight;

  // If target is significantly lower (more than 10% less)
  if (ratio < 0.9) {
    return 'lose';
  }

  // If target is significantly higher (more than 10% more)
  if (ratio > 1.1) {
    return 'gain';
  }

  // Otherwise, maintain
  return 'maintain';
}

// Detailed calculation breakdown for transparency
export interface CalculationDetails {
  rer: number;
  activityFactor: number;
  mer: number;
  weightGoalLabel: string;
  weightGoalAdjustmentPercent: number;
  targetCalories: number;
  caloriesPerGram: number;
  dailyGrams: number;
  treatAllowancePercentage: number;
  treatAllowanceCalories: number;
}

export function getCalculationDetails(
  catProfile: CatProfile,
  selectedFood: FoodItem,
  weightGoal: WeightGoal,
  customFactor?: number
): CalculationDetails {
  // Step 1: Calculate RER
  const rer = calculateRER(catProfile.currentWeight);

  // Step 2: Get activity factor
  const activityFactor = getActivityFactor(catProfile.activityLevel, catProfile.isNeutered);

  // Step 3: Calculate MER
  const mer = rer * activityFactor;

  // Step 4: Get weight goal adjustment
  const adjustmentFactor = getGoalAdjustmentFactor(weightGoal, customFactor);
  const adjustmentPercent = Math.round((adjustmentFactor - 1) * 100);

  // Step 5: Calculate target calories
  const targetCalories = calculateTargetCalories(mer, weightGoal, customFactor);

  // Step 6: Calculate daily grams needed
  const caloriesPerGram = selectedFood.caloriesPerHundredGrams / 100;
  const dailyGrams = calculateDailyFoodAmount(targetCalories, selectedFood.caloriesPerHundredGrams);

  // Step 7: Calculate treat allowance
  const treatPercentage = weightGoal === 'lose' ? 5 : 10;
  const treatAllowance = calculateTreatAllowance(targetCalories, weightGoal);

  // Determine weight goal label
  let weightGoalLabel = 'Maintain';
  if (weightGoal === 'lose') {
    weightGoalLabel = 'Lose Weight (−20%)';
  } else if (weightGoal === 'gain') {
    weightGoalLabel = 'Gain Weight (+20%)';
  } else if (weightGoal === 'custom') {
    weightGoalLabel = `Custom (${adjustmentPercent > 0 ? '+' : ''}${adjustmentPercent}%)`;
  }

  return {
    rer,
    activityFactor,
    mer,
    weightGoalLabel,
    weightGoalAdjustmentPercent: adjustmentPercent,
    targetCalories,
    caloriesPerGram,
    dailyGrams,
    treatAllowancePercentage: treatPercentage,
    treatAllowanceCalories: treatAllowance,
  };
}

export function calculateMixedFoodPortions(
  targetCalories: number,
  foods: FoodItem[],
  preferredRatios?: number[]
): FoodPortion[] {
  if (foods.length === 0) return [];
  
  if (foods.length === 1) {
    const grams = calculateDailyFoodAmount(targetCalories, foods[0].caloriesPerHundredGrams);
    return [{
      foodId: foods[0].id,
      grams: Math.round(grams),
      calories: targetCalories,
    }];
  }

  // For 2 foods with optional ratio
  if (foods.length === 2) {
    const [food1, food2] = foods;
    const ratio1 = preferredRatios?.[0] || 0.5;
    const ratio2 = preferredRatios?.[1] || 0.5;
    
    // Normalize ratios
    const totalRatio = ratio1 + ratio2;
    const normRatio1 = ratio1 / totalRatio;
    const normRatio2 = ratio2 / totalRatio;
    
    const cal1 = targetCalories * normRatio1;
    const cal2 = targetCalories * normRatio2;
    
    const grams1 = (cal1 / food1.caloriesPerHundredGrams) * 100;
    const grams2 = (cal2 / food2.caloriesPerHundredGrams) * 100;
    
    return [
      {
        foodId: food1.id,
        grams: Math.round(grams1),
        calories: cal1,
      },
      {
        foodId: food2.id,
        grams: Math.round(grams2),
        calories: cal2,
      },
    ];
  }

  // For 3+ foods, distribute evenly or by ratio
  const portions: FoodPortion[] = [];
  const ratios = preferredRatios || foods.map(() => 1 / foods.length);
  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
  
  foods.forEach((food, index) => {
    const ratio = ratios[index] / totalRatio;
    const calories = targetCalories * ratio;
    const grams = (calories / food.caloriesPerHundredGrams) * 100;
    
    portions.push({
      foodId: food.id,
      grams: Math.round(grams),
      calories,
    });
  });
  
  return portions;
}

// Unit Conversion Functions
export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

export function gramsToGrams(grams: number): number {
  return grams;
}

export function gramsToCups(grams: number, isDryFood: boolean = true): number {
  // Approximate: 1 cup dry food ≈ 100g, 1 cup wet food ≈ 240g
  const gramsPerCup = isDryFood ? 100 : 240;
  return grams / gramsPerCup;
}

export function cupsToGrams(cups: number, isDryFood: boolean = true): number {
  const gramsPerCup = isDryFood ? 100 : 240;
  return cups * gramsPerCup;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  if (from === 'kg' && to === 'lb') return kgToLb(value);
  if (from === 'lb' && to === 'kg') return lbToKg(value);
  return value;
}

export function formatWeightForDisplay(
  weightKg?: number,
  preferredUnit: WeightUnit = 'kg'
): string {
  if (weightKg === undefined || weightKg === null) {
    return '-';
  }
  const displayValue = convertWeight(weightKg, 'kg', preferredUnit);
  return `${displayValue.toFixed(2)} ${preferredUnit}`;
}

export function convertPortion(
  value: number,
  from: PortionUnit,
  to: PortionUnit,
  isDryFood: boolean = true
): number {
  if (from === to) return value;
  if (from === 'g' && to === 'cup') return gramsToCups(value, isDryFood);
  if (from === 'cup' && to === 'g') return cupsToGrams(value, isDryFood);
  return value;
}

// Body Condition Scoring based on NRC standards
export function calculateBodyCondition(weightKg: number, breed?: string): BodyCondition {
  // Simplified BCS calculation - in production, would use more sophisticated breed-specific data
  // Average adult cat weight: 3.6-4.5kg (8-10 lb)
  const avgWeight = 4.0;
  const ratio = weightKg / avgWeight;
  
  if (ratio < 0.7) return 'very-underweight';
  if (ratio < 0.85) return 'underweight';
  if (ratio <= 1.15) return 'ideal';
  if (ratio <= 1.35) return 'overweight';
  return 'obese';
}

export function getBodyConditionLabel(condition: BodyCondition): string {
  const labels: Record<BodyCondition, string> = {
    'very-underweight': 'Very Underweight',
    'underweight': 'Underweight',
    'ideal': 'Healthy Weight',
    'overweight': 'Overweight',
    'obese': 'Obese',
  };
  return labels[condition];
}

export function getBodyConditionDescription(condition: BodyCondition): string {
  const descriptions: Record<BodyCondition, string> = {
    'very-underweight': 'Zero body fat; ribs and spine visible from a distance',
    'underweight': 'Ribs are visible; waist is pronounced',
    'ideal': 'Ribs can be felt when petting; clearly defined waist is seen from above',
    'overweight': 'Ribs only felt when applying pressure; belly pooch visible when viewed from the side',
    'obese': "Ribs can't be felt; belly is extended",
  };
  return descriptions[condition];
}

// Treat Allowance Calculation
export function calculateTreatAllowance(
  totalDailyCalories: number,
  weightGoal: WeightGoal
): number {
  // 10% for maintenance/gain, 5% for weight loss per NRC guidelines
  const percentage = weightGoal === 'lose' ? 0.05 : 0.10;
  return Math.round(totalDailyCalories * percentage);
}

// Distribute calories across multiple meals
export function distributeMealsEvenly(
  totalGrams: number,
  totalCalories: number,
  mealsPerDay: number
): { grams: number; calories: number }[] {
  const meals: { grams: number; calories: number }[] = [];
  const gramsPerMeal = totalGrams / mealsPerDay;
  const caloriesPerMeal = totalCalories / mealsPerDay;
  
  for (let i = 0; i < mealsPerDay; i++) {
    meals.push({
      grams: Math.round(gramsPerMeal),
      calories: Math.round(caloriesPerMeal),
    });
  }
  
  return meals;
}
