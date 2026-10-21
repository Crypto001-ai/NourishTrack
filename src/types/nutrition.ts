/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MealCategory =
  | 'breakfast'
  | 'brunch'
  | 'lunch'
  | 'midday_snack'
  | 'dinner'
  | 'evening_snack'
  | 'other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type NutritionGoal =
  | 'balanced'
  | 'variety'
  | 'increase_protein'
  | 'reduce_sodium'
  | 'increase_fiber'
  | 'condition_management';

export type HealthCondition =
  | 'hypertension'
  | 'diabetes_type2'
  | 'diabetes_type1'
  | 'kidney_disease'
  | 'gerd'
  | 'gout'
  | 'celiac'
  | 'high_cholesterol'
  | 'none';

export type FoodAllergy =
  | 'peanuts'
  | 'tree_nuts'
  | 'shellfish'
  | 'dairy'
  | 'eggs'
  | 'gluten'
  | 'soy'
  | 'fish'
  | 'sesame';

export type DietaryPreference =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'low_sodium'
  | 'low_fodmap';

export type FoodGroup =
  | 'whole_grains'
  | 'refined_grains'
  | 'tubers_roots'
  | 'vegetables'
  | 'fruits'
  | 'protein_foods'
  | 'legumes'
  | 'dairy_plant'
  | 'healthy_fats'
  | 'snacks_sweets';

export type DataConfidence = 'verified_composition' | 'standardized_recipe' | 'estimate';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  age: number;
  sex: 'female' | 'male' | 'prefer_not_to_say';
  heightCm?: number;
  weightKg?: number;
  activityLevel: ActivityLevel;
  primaryGoal: NutritionGoal;
  customGoalNotes?: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  maxSodiumMg: number;
  maxAddedSugarG: number;
}

export interface HealthPreference {
  userId: string;
  conditions: HealthCondition[];
  customConditions?: string[];
  allergies: FoodAllergy[];
  customAllergies?: string[];
  dietaryRestrictions: DietaryPreference[];
  educationalConsentAccepted: boolean;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  localName?: string;
  category:
    | 'grains_tubers'
    | 'soups_stews'
    | 'proteins'
    | 'vegetables'
    | 'fruits'
    | 'legumes'
    | 'snacks_bakery'
    | 'dairy_alternatives'
    | 'fats_oils'
    | 'beverages';
  servingUnit: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  addedSugar: number;
  foodGroup: FoodGroup;
  dataSource: string;
  dataQuality: DataConfidence;
  allergens: string[];
  tags: string[];
  isCustom?: boolean;
}

export interface MealRecordItem {
  id: string;
  foodId: string;
  foodName: string;
  portionUnit: string;
  quantity: number;
  servingMultiplier: number;
  preparationMethod?: string;
  calculatedCalories: number;
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
  calculatedFiber: number;
  calculatedSodium: number;
  calculatedAddedSugar: number;
  dataSource: string;
  dataQuality: DataConfidence;
  foodGroup: FoodGroup;
}

export interface MealRecord {
  id: string;
  userId: string;
  category: MealCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  items: MealRecordItem[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  totalAddedSugar: number;
  createdAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  totalAddedSugar: number;
  mealCount: number;
  mealsLogged: MealCategory[];
  foodGroupsRepresented: FoodGroup[];
  targetComparison: {
    caloriesPercent: number;
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
    fiberPercent: number;
    sodiumStatus: 'optimal' | 'moderate' | 'high';
    addedSugarStatus: 'optimal' | 'moderate' | 'high';
  };
  dataConfidenceScore: 'high' | 'moderate' | 'contains_estimates';
  estimatedItemsCount: number;
}

export interface DailyInsight {
  date: string;
  whatWentWell: string[];
  whatCouldImprove: string[];
  suggestedImprovements: {
    title: string;
    action: string;
    reason: string;
    alternativeFood?: string;
  }[];
  conditionSpecificNotes?: {
    condition: string;
    note: string;
    educationalNotice: string;
  }[];
  dataConfidenceExplanation: string;
  aiCommentary?: string;
}

export interface WeeklyReportData {
  startDate: string;
  endDate: string;
  daysWithMeals: number;
  totalMealsLogged: number;
  dailyAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  dailyTrend: {
    date: string;
    dayName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    mealsCount: number;
  }[];
  foodGroupFrequency: {
    group: FoodGroup;
    label: string;
    count: number;
    targetDays: number;
  }[];
  repeatedPatterns: string[];
  goalProgressSummary: string;
  keyRecommendations: string[];
}

export interface MealSuggestion {
  id: string;
  title: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  foods: {
    name: string;
    portion: string;
    notes?: string;
  }[];
  estimatedNutrients: {
    calories: number;
    protein: number;
    fiber: number;
    carbs: number;
    fat: number;
    sodium: number;
  };
  targetBenefits: string[];
  rationale: string;
  isNigerianInspired: boolean;
  prepTimeMinutes: number;
}
