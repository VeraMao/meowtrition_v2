export type WeightUnit = 'kg' | 'lb';
export type PortionUnit = 'g' | 'cup';
export type CalorieUnit = 'kcal/100g' | 'kcal/cup' | 'kcal ME/kg';
export type BodyCondition = 'very-underweight' | 'underweight' | 'ideal' | 'overweight' | 'obese';

export interface UnitPreferences {
  weight: WeightUnit;
  portion: PortionUnit;
  calorie: CalorieUnit;
}

export type ThemeName =
  | 'warm-amber'
  | 'soft-cream-neutral'
  | 'frosted-taupe'
  | 'nutmeg-sand';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  textSecondary: string;
  muted: string;
}

export interface CatProfile {
  id: string;
  name: string;
  breed?: string;
  gender: 'male' | 'female';
  age: number;
  currentWeight: number; // Always stored in kg internally
  targetWeight?: number; // Always stored in kg internally
  weightUnitPreference?: WeightUnit; // Preferred unit for display/input
  isNeutered: boolean;
  activityLevel: 'low' | 'medium' | 'high';
  photoUrl?: string;
  selectedFoodId?: string; // Main feeding food
  selectedFoodIds?: string[]; // All foods in use
  feedingPlan?: FeedingPlan;
  bodyCondition?: BodyCondition;
  weightHistory?: WeightEntry[];
  themePreference?: ThemeName;
  userLibraryFoodIds?: string[]; // Foods added to user's personal library
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  caloriesPerHundredGrams: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
  fiber?: number;
  type: 'dry' | 'wet' | 'treat' | 'prescription' | 'custom';
  rating?: number; // Average user rating 1-5
  reviewCount?: number;
  recommendedFor?: ('weight-loss' | 'maintenance' | 'weight-gain')[];
  reviews?: FoodReview[];
  imageUrl?: string;
  tags?: string[]; // e.g., "Grain-free", "High-protein", "Low-cal"
  nrcCompliant?: boolean;
}

export interface FoodPortion {
  foodId: string;
  grams: number;
  calories: number;
}

export interface MealSchedule {
  time: string; // Format: "HH:MM"
  grams: number;
  calories: number;
  portions?: FoodPortion[];
}

export interface FeedingPlan {
  totalGramsPerDay: number;
  totalCaloriesPerDay: number;
  amGrams: number;
  pmGrams: number;
  foodId: string;
  weightGoal?: WeightGoal;
  customFactor?: number;
  // Mixed plan support
  isMixed?: boolean;
  amPortions?: FoodPortion[];
  pmPortions?: FoodPortion[];
  // Meal frequency support
  mealsPerDay?: number; // 1-5
  feedingType?: 'scheduled' | 'free';
  mealSchedules?: MealSchedule[];
  // Treat allowance
  treatAllowanceCalories?: number;
}

export interface FeedingLog {
  id: string;
  timestamp: Date;
  grams: number;
  foodId: string;
  calories: number;
  isTreat?: boolean;
  treatTag?: 'training' | 'snack' | 'health';
  catId?: string;
  customFoodName?: string; // For manually entered foods
}

export interface WeightEntry {
  date: Date;
  weight: number; // Always in kg
}

export interface FoodReview {
  id: string;
  userId: string;
  userName: string;
  catName?: string;
  catPhotoUrl?: string;
  rating: number; // 1-5
  timestamp: Date;
  content: string;
  accuracyRating?: number; // 1-5, for calorie info accuracy
  photoUrl?: string;
  helpfulCount?: number;
  tags?: string[]; // e.g., "Picky eater approved", "Helps with digestion"
}

export type WeightGoal = 'maintain' | 'lose' | 'gain' | 'custom';

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  catName: string;
  catPhotoUrl?: string;
  timestamp: Date;
  content: string;
  foodItems: {
    id: string;
    name: string;
    brand?: string;
  }[];
  combinationType?: 'single' | 'mixed';
  rating: number; // 1-5
  likes: number;
  comments: CommunityComment[];
  tags: string[];
}

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  content: string;
}

export interface AppSettings {
  unitPreferences: UnitPreferences;
  notifications?: boolean;
  theme?: 'light' | 'dark';
}

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'profile-setup'
  | 'food-library'
  | 'food-detail'
  | 'feeding-plan'
  | 'meal-mix-optimizer'
  | 'dashboard'
  | 'feeding-log'
  | 'settings'
  | 'community'
  | 'manage-cats'
  | 'manage-foods'
  | 'theme-selector';
