# Meowtrition Feeding Plan & Dry/Wet Mix Logic

This note captures the calculation workflow that powers the feeding planner. It is structured so the pure functions can be dropped into any service layer while leaving rounding/formatting decisions to the UI.

---

## 1. Daily Calorie Target

We start from the NRC-style relationship between weight, activity, and metabolic energy:

```
RER = 70 * (target_weight_kg ^ 0.75)
MER = RER * activity_factor
TotalKcal = MER * goal_adjustment_factor
```

- `target_weight_kg` falls back to `weight_kg` when the user has not specified a goal weight.
- `goal_adjustment_factor` defaults based on `goal_type` unless the user supplied a custom override.

```ts
type GoalType = 'maintain' | 'lose' | 'gain' | 'custom';

interface DailyKcalParams {
  weightKg: number;
  targetWeightKg?: number;
  activityFactor: number;
  goalType: GoalType;
  goalAdjustmentFactor?: number;
}

function calculateDailyKcalTarget(params: DailyKcalParams): number
```

Implementation tips:
- Validate `activityFactor` (>0) and `weightKg`.
- Preset `goalAdjustmentFactor` to `0.8 / 1.0 / 1.2` for lose/maintain/gain. Only use `goalAdjustmentFactor` when `goalType === 'custom'` and the caller provided a value.
- Return a floating-point kcal target. Consumers can round later.

---

## 2. Split Kcal Across Dry vs. Wet Foods

With a total kcal target, we apportion calories to dry and wet foods, then convert to grams using the foods’ kcal density.

```
DryKcal = TotalKcal * dryRatio
WetKcal = TotalKcal * wetRatio

DryTotal_g = DryKcal / (dryKcalPer100g / 100)
WetTotal_g = WetKcal / (wetKcalPer100g / 100)
```

```ts
interface DailyGramsParams {
  totalKcal: number;
  dryKcalPer100g: number;
  wetKcalPer100g: number;
  dryRatio: number;
  wetRatio: number;
}

function calculateDailyGramsForDryAndWet(
  params: DailyGramsParams
): { dryTotalGrams: number; wetTotalGrams: number; }
```

Validation:
- `dryRatio + wetRatio` must sum to ~1.0 (allow ±0.01 tolerance).
- Calorie densities must be >0.

Return raw floats (no rounding).

---

## 3. Feeding Style & Meals Per Day

Once daily dry/wet grams are known, portions are scheduled according to the feeding style.

### Common Inputs

```ts
type FeedingStyle = 'all_scheduled' | 'free_dry_schedule_wet';

interface MealPlanInput {
  dryTotalGrams: number;
  wetTotalGrams: number;
  mealsPerDay: number;     // integer 1–5
  feedingStyle: FeedingStyle;
  mealShares?: number[];   // optional custom split
}
```

Shared validation:
- `mealsPerDay` must be between 1 and 5.
- If `mealShares` is provided: `length === mealsPerDay` and `sum ≈ 1.0` (±0.01). Otherwise default to equal fractions.

### 3.1 All Meals Scheduled

Both dry and wet food are portioned at each meal. For equal splits, each meal gets `total / mealsPerDay`. For custom splits, multiply each meal’s share by the daily totals.

```ts
function splitAllScheduledMeals(input: MealPlanInput): {
  meals: { dryGrams: number; wetGrams: number; shareOfDay: number }[];
}
```

### 3.2 Free-Feed Dry + Scheduled Wet

Dry food is provided as a daily limit (for auto feeders). Wet food is still portioned per meal using equal or custom shares.

```ts
function splitFreeDryScheduleWet(input: MealPlanInput): {
  dryDailyLimitGrams: number;
  wetMeals: { wetGrams: number; shareOfDay: number }[];
}
```

---

## 4. Full Plan Builder

`generateDailyFeedingPlan` ties the previous steps together and returns UI-ready data.

```ts
interface DailyFeedingPlan {
  totalKcal: number;
  dryTotalGrams: number;
  wetTotalGrams: number;
  feedingStyle: FeedingStyle;
  meals: {
    label: string;
    dryGrams?: number;
    wetGrams?: number;
    shareOfDay: number;
  }[];
  dryDailyLimitGrams?: number;
}

function generateDailyFeedingPlan(params: {
  weightKg: number;
  targetWeightKg?: number;
  activityFactor: number;
  goalType: GoalType;
  goalAdjustmentFactor?: number;
  dryKcalPer100g: number;
  wetKcalPer100g: number;
  dryRatio: number;
  wetRatio: number;
  mealsPerDay: number;
  feedingStyle: FeedingStyle;
  mealShares?: number[];
}): DailyFeedingPlan
```

Algorithm:
1. Compute `totalKcal` via `calculateDailyKcalTarget`.
2. Compute `dryTotalGrams` / `wetTotalGrams`.
3. Generate default meal labels (“Breakfast”, “Lunch”, “Dinner”, “Snack 1”, “Snack 2”) based on `mealsPerDay`.
4. Branch on `feedingStyle`:
   - `all_scheduled`: call `splitAllScheduledMeals` and map shares to the labels.
   - `free_dry_schedule_wet`: call `splitFreeDryScheduleWet`, keep `dryDailyLimitGrams`, and only place wet values per meal.
5. Return a `DailyFeedingPlan` object with floats (UI may round later).

---

## 5. Example Walkthrough

Input:
- Weight 4.5 kg, maintain goal (so target weight = 4.5 kg).
- `activityFactor = 1.2`, `goalAdjustmentFactor = 1.0`.
- `dryKcalPer100g = 375`, `wetKcalPer100g = 95`.
- Ratios: `dryRatio = 0.7`, `wetRatio = 0.3`.
- `mealsPerDay = 2`, `feedingStyle = 'all_scheduled'`, `mealShares = [0.5, 0.5]`.

Processing:
1. `TotalKcal ≈ 302 kcal/day`.
2. `dryTotalGrams ≈ 56 g`, `wetTotalGrams ≈ 95 g`.
3. Meals:
   - Breakfast: ~28 g dry, ~47.5 g wet.
   - Dinner: ~28 g dry, ~47.5 g wet.

Rounded values are deferred to the presentation layer, but the plan object now contains everything the UI needs to display “Dry: 56 g/day, Wet: 95 g/day split evenly across two meals.”

---

## 6. Additional Notes

- Keep functions pure—no reliance on React state or browser APIs.
- Throw or return descriptive errors when validation fails (bad ratios, invalid meal counts, etc.).
- All conversions stay in grams and kcal; any ounce/cup conversions live higher in the stack.
