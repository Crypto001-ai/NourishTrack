/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyInsight,
  DailyNutritionSummary,
  FoodAllergy,
  FoodGroup,
  FoodItem,
  HealthCondition,
  HealthPreference,
  MealCategory,
  MealRecord,
  MealSuggestion,
  NutritionGoal,
  UserProfile,
  WeeklyReportData,
} from '../types/nutrition';

/**
 * Calculates evidence-based dietary reference targets using standard
 * Mifflin-St Jeor / DRI guidelines adapted for user goals.
 */
export function calculateReferenceTargets(
  profile: Partial<UserProfile>
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodiumMax: number;
  addedSugarMax: number;
} {
  const age = profile.age || 30;
  const sex = profile.sex || 'female';
  const weight = profile.weightKg || 68;
  const height = profile.heightCm || 168;
  const activity = profile.activityLevel || 'moderate';
  const goal = profile.primaryGoal || 'balanced';

  // Mifflin-St Jeor BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Physical Activity Level multipliers
  const palMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = Math.round(bmr * (palMultipliers[activity] || 1.5));

  let calories = tdee;
  let proteinRatio = 0.2; // 20%
  let carbsRatio = 0.5; // 50%
  let fatRatio = 0.3; // 30%
  let fiber = 28; // g
  let sodiumMax = 2300; // mg (AHA/WHO general guidance)
  let addedSugarMax = Math.round((calories * 0.05) / 4); // <5-10% of energy

  if (goal === 'increase_protein') {
    proteinRatio = 0.28;
    carbsRatio = 0.44;
    fatRatio = 0.28;
  } else if (goal === 'reduce_sodium') {
    sodiumMax = 1500; // DASH standard guidance
  } else if (goal === 'increase_fiber') {
    fiber = 35;
  }

  const proteinG = Math.round((calories * proteinRatio) / 4);
  const carbsG = Math.round((calories * carbsRatio) / 4);
  const fatG = Math.round((calories * fatRatio) / 9);

  return {
    calories,
    protein: proteinG,
    carbs: carbsG,
    fat: fatG,
    fiber,
    sodiumMax,
    addedSugarMax,
  };
}

/**
 * Summarizes daily nutrition from recorded meals
 */
export function calculateDailySummary(
  date: string,
  meals: MealRecord[],
  profile: UserProfile
): DailyNutritionSummary {
  const dayMeals = meals.filter((m) => m.date === date);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalAddedSugar = 0;
  let estimatedItemsCount = 0;
  const foodGroupsSet = new Set<FoodGroup>();
  const mealCategories = dayMeals.map((m) => m.category);

  for (const meal of dayMeals) {
    for (const item of meal.items) {
      totalCalories += item.calculatedCalories;
      totalProtein += item.calculatedProtein;
      totalCarbs += item.calculatedCarbs;
      totalFat += item.calculatedFat;
      totalFiber += item.calculatedFiber;
      totalSodium += item.calculatedSodium;
      totalAddedSugar += item.calculatedAddedSugar;

      if (item.dataQuality === 'estimate') {
        estimatedItemsCount++;
      }
      if (item.foodGroup) {
        foodGroupsSet.add(item.foodGroup);
      }
    }
  }

  // Rounded values
  totalCalories = Math.round(totalCalories);
  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCarbs = Math.round(totalCarbs * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;
  totalFiber = Math.round(totalFiber * 10) / 10;
  totalSodium = Math.round(totalSodium);
  totalAddedSugar = Math.round(totalAddedSugar * 10) / 10;

  const targetCal = profile.targetCalories || 2000;
  const targetProt = profile.targetProteinG || 75;
  const targetCarb = profile.targetCarbsG || 250;
  const targetF = profile.targetFatG || 65;
  const targetFib = profile.targetFiberG || 28;
  const maxSod = profile.maxSodiumMg || 2300;
  const maxSugar = profile.maxAddedSugarG || 35;

  const sodiumStatus: 'optimal' | 'moderate' | 'high' =
    totalSodium <= maxSod * 0.75
      ? 'optimal'
      : totalSodium <= maxSod
        ? 'moderate'
        : 'high';

  const addedSugarStatus: 'optimal' | 'moderate' | 'high' =
    totalAddedSugar <= maxSugar * 0.75
      ? 'optimal'
      : totalAddedSugar <= maxSugar
        ? 'moderate'
        : 'high';

  const dataConfidenceScore: 'high' | 'moderate' | 'contains_estimates' =
    estimatedItemsCount === 0
      ? 'high'
      : estimatedItemsCount <= 2
        ? 'moderate'
        : 'contains_estimates';

  return {
    date,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalSodium,
    totalAddedSugar,
    mealCount: dayMeals.length,
    mealsLogged: mealCategories,
    foodGroupsRepresented: Array.from(foodGroupsSet),
    targetComparison: {
      caloriesPercent: Math.min(200, Math.round((totalCalories / targetCal) * 100)),
      proteinPercent: Math.min(200, Math.round((totalProtein / targetProt) * 100)),
      carbsPercent: Math.min(200, Math.round((totalCarbs / targetCarb) * 100)),
      fatPercent: Math.min(200, Math.round((totalFat / targetF) * 100)),
      fiberPercent: Math.min(200, Math.round((totalFiber / targetFib) * 100)),
      sodiumStatus,
      addedSugarStatus,
    },
    dataConfidenceScore,
    estimatedItemsCount,
  };
}

/**
 * Generate evidence-based daily insight with supportive tone
 */
export function generateDailyInsight(
  summary: DailyNutritionSummary,
  profile: UserProfile,
  healthPref?: HealthPreference
): DailyInsight {
  const whatWentWell: string[] = [];
  const whatCouldImprove: string[] = [];
  const suggestedImprovements: DailyInsight['suggestedImprovements'] = [];
  const conditionNotes: DailyInsight['conditionSpecificNotes'] = [];

  if (summary.mealCount === 0) {
    return {
      date: summary.date,
      whatWentWell: ['Ready to record your meals for today.'],
      whatCouldImprove: ['No meals have been logged yet for this date.'],
      suggestedImprovements: [
        {
          title: 'Start with your first meal',
          action: 'Record what you ate for breakfast, lunch, or a snack.',
          reason: 'Consistent logging helps you discover patterns without any pressure.',
        },
      ],
      dataConfidenceExplanation:
        'Nutrient totals will appear once meals are entered.',
    };
  }

  // Fiber evaluation
  if (summary.totalFiber >= (profile.targetFiberG || 28) * 0.8) {
    whatWentWell.push(
      `Great fiber intake (${summary.totalFiber}g) today, supporting healthy digestion and stable energy.`
    );
  } else if (summary.totalFiber < 15) {
    whatCouldImprove.push(
      `Fiber intake is on the lower side (${summary.totalFiber}g of ${profile.targetFiberG}g target).`
    );
    suggestedImprovements.push({
      title: 'Boost dietary fiber with legumes or greens',
      action: 'Add a side of steamed Moi Moi, Efo Riro (spinach stew), or lentils.',
      reason:
        'Soluble and insoluble fibers support regular digestion, gut microbiome diversity, and steady satiety.',
      alternativeFood: 'Moi Moi or Steamed Efo Riro',
    });
  }

  // Protein evaluation
  const proteinPercent = summary.targetComparison.proteinPercent;
  if (proteinPercent >= 80 && proteinPercent <= 125) {
    whatWentWell.push(
      `Balanced protein intake (${summary.totalProtein}g), contributing to tissue repair and satiety.`
    );
  } else if (proteinPercent < 70) {
    whatCouldImprove.push(
      `Protein intake (${summary.totalProtein}g) is below your personalized target (${profile.targetProteinG}g).`
    );
    suggestedImprovements.push({
      title: 'Incorporate a lean protein source',
      action:
        'Consider adding grilled chicken, boiled eggs, fish, or steamed bean pudding (moi moi) to your meals.',
      reason: 'Protein supports muscle maintenance, enzyme production, and prolonged meal satisfaction.',
      alternativeFood: 'Grilled Fish or Boiled Eggs',
    });
  }

  // Sodium evaluation
  if (summary.totalSodium > (profile.maxSodiumMg || 2300)) {
    whatCouldImprove.push(
      `Estimated sodium intake reached ${summary.totalSodium}mg (higher than the recommended ${profile.maxSodiumMg}mg ceiling).`
    );
    suggestedImprovements.push({
      title: 'Flavor with aromatics instead of bouillon cubes',
      action:
        'Season homemade stews and soups with fresh ginger, garlic, locust beans (iru), and herbs.',
      reason:
        'Standard seasoning cubes can add 400-600mg sodium per cube. Whole spices enhance depth without excess sodium.',
    });
  } else {
    whatWentWell.push(
      `Sodium intake (${summary.totalSodium}mg) remained within healthy bounds today.`
    );
  }

  // Food Group Variety
  const fgCount = summary.foodGroupsRepresented.length;
  if (fgCount >= 4) {
    whatWentWell.push(
      `Wonderful dietary variety: you consumed foods across ${fgCount} distinct food groups today.`
    );
  } else if (fgCount <= 2 && summary.mealCount >= 2) {
    whatCouldImprove.push(
      `Meals today centered on fewer food groups (${fgCount} represented).`
    );
    suggestedImprovements.push({
      title: 'Introduce a colorful vegetable or fresh fruit',
      action: 'Pair your next meal with sliced garden egg, cucumber, or steamed leafy greens.',
      reason: 'A wider spectrum of plant foods supplies diverse micronutrients and polyphenols.',
    });
  }

  // Health condition educational guidance
  if (healthPref?.conditions && healthPref.conditions.length > 0) {
    for (const cond of healthPref.conditions) {
      if (cond === 'hypertension') {
        conditionNotes.push({
          condition: 'Hypertension (High Blood Pressure)',
          note: `Today's sodium intake: ${summary.totalSodium}mg. Emphasize potassium-rich whole foods like boiled plantains, leafy greens, and fresh fruits while moderating sodium bouillon.`,
          educationalNotice:
            'Educational guidance only. Food choices support cardiovascular wellness but do not replace prescribed antihypertensive therapy or clinical supervision.',
        });
      } else if (cond === 'diabetes_type2' || cond === 'diabetes_type1') {
        conditionNotes.push({
          condition: 'Diabetes / Blood Sugar Consideration',
          note: `Carbohydrates consumed: ${summary.totalCarbs}g. Pairing carbohydrate foods (like brown rice, ofada, or yam) with protein and ample fiber helps slow gastric emptying and promotes steady post-meal balance.`,
          educationalNotice:
            'Informational only. Carbohydrate responses vary among individuals. Always follow your blood glucose monitoring schedule and guidance from your endocrinologist or certified diabetes educator.',
        });
      } else if (cond === 'kidney_disease') {
        conditionNotes.push({
          condition: 'Kidney Health Consideration',
          note: 'Kidney disease nutritional guidelines are highly individualized depending on your glomerular filtration rate (GFR), stage, and lab electrolyte levels (potassium, phosphorus, protein).',
          educationalNotice:
            'Special clinical notice: NourishTrack does NOT generate automated restrictions for kidney disease. Please consult a registered renal dietitian for personalized targets.',
        });
      }
    }
  }

  // Confidence explanation
  let confidenceText =
    'All recorded items match verified laboratory and standardized recipe composition data.';
  if (summary.estimatedItemsCount > 0) {
    confidenceText = `${summary.estimatedItemsCount} food item(s) used user-entered or recipe estimates. Portions and preparation methods influence exact numbers.`;
  }

  return {
    date: summary.date,
    whatWentWell: whatWentWell.length > 0 ? whatWentWell : ['Consistent recording is a strong first step toward nutrition awareness.'],
    whatCouldImprove: whatCouldImprove.length > 0 ? whatCouldImprove : ['No significant nutrient gaps identified based on today\'s logged foods.'],
    suggestedImprovements:
      suggestedImprovements.length > 0
        ? suggestedImprovements
        : [
            {
              title: 'Maintain your balanced plate',
              action: 'Continue including whole grains, healthy proteins, and colorful vegetables.',
              reason: 'Consistent balanced meals support sustained energy and long-term vitality.',
            },
          ],
    conditionSpecificNotes: conditionNotes.length > 0 ? conditionNotes : undefined,
    dataConfidenceExplanation: confidenceText,
  };
}

/**
 * Generate weekly summary and trends
 */
export function generateWeeklyReport(
  meals: MealRecord[],
  profile: UserProfile,
  daysCount: number = 7
): WeeklyReportData {
  const today = new Date();
  const dailyTrend: WeeklyReportData['dailyTrend'] = [];
  const foodGroupCountMap = new Map<FoodGroup, number>();

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let daysWithMeals = 0;
  let totalMealsCount = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayMeals = meals.filter((m) => m.date === dateStr);
    let dayCal = 0;
    let dayProt = 0;
    let dayCarb = 0;
    let dayFat = 0;
    let dayFib = 0;
    let daySod = 0;

    if (dayMeals.length > 0) {
      daysWithMeals++;
      totalMealsCount += dayMeals.length;
      const dayFoodGroups = new Set<FoodGroup>();

      for (const meal of dayMeals) {
        for (const it of meal.items) {
          dayCal += it.calculatedCalories;
          dayProt += it.calculatedProtein;
          dayCarb += it.calculatedCarbs;
          dayFat += it.calculatedFat;
          dayFib += it.calculatedFiber;
          daySod += it.calculatedSodium;
          if (it.foodGroup) dayFoodGroups.add(it.foodGroup);
        }
      }

      for (const fg of dayFoodGroups) {
        foodGroupCountMap.set(fg, (foodGroupCountMap.get(fg) || 0) + 1);
      }
    }

    totalCalories += dayCal;
    totalProtein += dayProt;
    totalCarbs += dayCarb;
    totalFat += dayFat;
    totalFiber += dayFib;
    totalSodium += daySod;

    dailyTrend.push({
      date: dateStr,
      dayName,
      calories: Math.round(dayCal),
      protein: Math.round(dayProt * 10) / 10,
      carbs: Math.round(dayCarb * 10) / 10,
      fat: Math.round(dayFat * 10) / 10,
      fiber: Math.round(dayFib * 10) / 10,
      sodium: Math.round(daySod),
      mealsCount: dayMeals.length,
    });
  }

  const divisor = Math.max(1, daysWithMeals);
  const dailyAverages = {
    calories: Math.round(totalCalories / divisor),
    protein: Math.round((totalProtein / divisor) * 10) / 10,
    carbs: Math.round((totalCarbs / divisor) * 10) / 10,
    fat: Math.round((totalFat / divisor) * 10) / 10,
    fiber: Math.round((totalFiber / divisor) * 10) / 10,
    sodium: Math.round(totalSodium / divisor),
  };

  const groupLabels: Record<FoodGroup, string> = {
    vegetables: 'Vegetables & Leafy Greens',
    fruits: 'Fresh Fruits',
    whole_grains: 'Whole Grains & High-Fiber Carbs',
    refined_grains: 'Refined Grains',
    tubers_roots: 'Tubers & Plantain',
    legumes: 'Beans & Legumes',
    protein_foods: 'Fish, Poultry & Lean Meats',
    dairy_plant: 'Dairy & Plant Alternatives',
    healthy_fats: 'Healthy Fats & Seeds',
    snacks_sweets: 'Pastries & Snacks',
  };

  const trackedGroups: FoodGroup[] = [
    'vegetables',
    'fruits',
    'whole_grains',
    'legumes',
    'protein_foods',
    'healthy_fats',
  ];

  const foodGroupFrequency = trackedGroups.map((group) => ({
    group,
    label: groupLabels[group],
    count: foodGroupCountMap.get(group) || 0,
    targetDays: Math.min(daysCount, 5),
  }));

  const repeatedPatterns: string[] = [];
  if (daysWithMeals >= 3) {
    if (dailyAverages.fiber < 20) {
      repeatedPatterns.push(
        'Fibre intake averaged below 20g across recorded days, suggesting opportunities to add more steamed beans or leafy stews.'
      );
    } else {
      repeatedPatterns.push(
        `Solid fibre consistency: averaged ${dailyAverages.fiber}g/day across recorded days.`
      );
    }

    if (dailyAverages.protein >= (profile.targetProteinG || 75) * 0.85) {
      repeatedPatterns.push(
        `Consistently meeting your protein targets (averaged ${dailyAverages.protein}g/day).`
      );
    }

    if (dailyAverages.sodium > (profile.maxSodiumMg || 2300)) {
      repeatedPatterns.push(
        `Sodium frequently averaged ${dailyAverages.sodium}mg, indicating that restaurant or heavily seasoned meals are common.`
      );
    }
  } else {
    repeatedPatterns.push(
      'Logged fewer than 3 days this week. Missing entries are not considered skipped meals; consistency will unlock deeper weekly trends.'
    );
  }

  const startDate = dailyTrend[0]?.date || '';
  const endDate = dailyTrend[dailyTrend.length - 1]?.date || '';

  const recommendations = [
    'Try substituting deep-fried plantain (dodo) with boiled or roasted ripe plantain (boli) twice a week to reduce saturated oil intake.',
    'Include at least one serving of leafy greens (like Efo Riro, Afang, or fresh spinach) on at least 5 days each week.',
    'Keep your hydration steady by enjoying drinking water alongside meals and limiting sweetened sodas or syrups.',
  ];

  return {
    startDate,
    endDate,
    daysWithMeals,
    totalMealsLogged: totalMealsCount,
    dailyAverages,
    dailyTrend,
    foodGroupFrequency,
    repeatedPatterns,
    goalProgressSummary: `You logged meals on ${daysWithMeals} of the past ${daysCount} days. Average daily intake stood at ${dailyAverages.calories} kcal with ${dailyAverages.protein}g protein and ${dailyAverages.fiber}g fibre.`,
    keyRecommendations: recommendations,
  };
}

/**
 * Smart meal suggestions ("What Should I Eat?")
 * Deterministic engine prioritizing familiar Nigerian & wholesome whole foods,
 * filtering out any food that triggers user allergies or dietary restrictions.
 */
export const MEAL_SUGGESTION_CATALOG: MealSuggestion[] = [
  {
    id: 'sug_moi_moi_greens',
    title: 'Steamed Moi Moi & Rich Vegetable Stew',
    category: 'dinner',
    description:
      'Nutrient-dense protein and fiber meal that promotes fullness without high saturated fat.',
    foods: [
      { name: 'Moi Moi (steamed bean pudding)', portion: '1 wrap (160g)' },
      { name: 'Efo Riro (spinach stew with peppers)', portion: '1 ladle (160g)' },
      { name: 'Grilled Tilapia Fish', portion: '1 small fillet (100g)' },
    ],
    estimatedNutrients: {
      calories: 420,
      protein: 36,
      fiber: 9.8,
      carbs: 28,
      fat: 16,
      sodium: 710,
    },
    targetBenefits: [
      'High in plant & marine protein',
      'High in soluble fiber',
      'Moderate glycemic impact',
    ],
    rationale:
      'Ideal for evening meals when daytime intake was carbohydrate-heavy. Rich in folate, magnesium, and dietary fiber.',
    isNigerianInspired: true,
    prepTimeMinutes: 25,
  },
  {
    id: 'sug_ofada_ayamase_greens',
    title: 'Unpolished Ofada Rice with Steamed Greens & Boiled Egg',
    category: 'lunch',
    description:
      'Wholesome traditional unpolished brown rice rich in B-vitamins and slow-digesting complex carbs.',
    foods: [
      { name: 'Ofada Rice (cooked)', portion: '1 cup (195g)' },
      { name: 'Fresh Steamed Okra or Efo', portion: '1 cup (150g)' },
      { name: 'Whole Boiled Egg', portion: '1 large' },
      { name: 'Grilled Chicken Breast', portion: '80g' },
    ],
    estimatedNutrients: {
      calories: 460,
      protein: 38,
      fiber: 8.5,
      carbs: 49,
      fat: 11,
      sodium: 380,
    },
    targetBenefits: [
      'Unrefined complex carbohydrates',
      'Low sodium preparation',
      'Steady glucose release',
    ],
    rationale:
      'Unpolished Ofada preserves the nutrient-rich bran layer. Paired with lean poultry and egg for complete amino acid variety.',
    isNigerianInspired: true,
    prepTimeMinutes: 20,
  },
  {
    id: 'sug_boiled_plantain_peppersoup',
    title: 'Boiled Ripe Plantain with Catfish Pepper Soup',
    category: 'dinner',
    description:
      'A comforting, aromatic light dinner naturally low in added fat and packed with lean omega-3 protein.',
    foods: [
      { name: 'Boiled Ripe Plantain', portion: '1 medium (150g)' },
      { name: 'Catfish Pepper Soup in herbal broth', portion: '1 bowl with fish (300g)' },
    ],
    estimatedNutrients: {
      calories: 360,
      protein: 27.5,
      fiber: 4.7,
      carbs: 44,
      fat: 8.8,
      sodium: 545,
    },
    targetBenefits: [
      'Omega-3 fatty acids',
      'Naturally low in saturated fat',
      'Potassium for electrolyte balance',
    ],
    rationale:
      'Boiled plantain offers natural sweetness and potassium without the frying oil of dodo. Spiced broth aids digestion.',
    isNigerianInspired: true,
    prepTimeMinutes: 30,
  },
  {
    id: 'sug_oatmeal_berries_eggs',
    title: 'Warm Rolled Oats with Greek Yogurt & Boiled Egg',
    category: 'breakfast',
    description:
      'Balanced morning bowl containing beta-glucan fiber and high bioavailable protein for sustained morning focus.',
    foods: [
      { name: 'Rolled Oats (cooked with water/cinnamon)', portion: '1 cup cooked' },
      { name: 'Greek Yogurt (plain, low-fat)', portion: '1/2 cup (115g)' },
      { name: 'Fresh Apple or Banana slices', portion: '1/2 fruit' },
      { name: 'Boiled Egg', portion: '1 large' },
    ],
    estimatedNutrients: {
      calories: 385,
      protein: 22,
      fiber: 6.8,
      carbs: 48,
      fat: 10,
      sodium: 145,
    },
    targetBenefits: [
      'Heart-healthy beta-glucan',
      'Very low sodium',
      'Sustained satiety',
    ],
    rationale:
      'Provides a balance of soluble oats fiber and rapid + slow-digesting proteins to prevent mid-morning blood sugar spikes.',
    isNigerianInspired: false,
    prepTimeMinutes: 10,
  },
  {
    id: 'sug_ewa_aganyin_boiled_egg',
    title: 'Ewa Aganyin with Boiled Egg & Sliced Avocado',
    category: 'lunch',
    description:
      'High-fiber plant protein powerhouse using slow-cooked Nigerian honey beans.',
    foods: [
      { name: 'Ewa Aganyin (mashed honey beans)', portion: '1 cup (220g)' },
      { name: 'Boiled Egg', portion: '1 large' },
      { name: 'Fresh Avocado slices', portion: '1/4 avocado (40g)' },
    ],
    estimatedNutrients: {
      calories: 435,
      protein: 22.5,
      fiber: 12.5,
      carbs: 41,
      fat: 17.5,
      sodium: 470,
    },
    targetBenefits: [
      'Outstanding fiber (12g+)',
      'Rich in folate & magnesium',
      'Monounsaturated fats from avocado',
    ],
    rationale:
      'Honey beans are packed with prebiotic fibers that nourish gut flora. Paired with healthy fats to enhance fat-soluble nutrient absorption.',
    isNigerianInspired: true,
    prepTimeMinutes: 15,
  },
  {
    id: 'sug_amala_giri_efo',
    title: 'Amala with Gbegiri & Efo Riro (Abula balanced)',
    category: 'dinner',
    description:
      'Traditional yam flour swallow with yellow bean soup (gbegiri) and leafy green stew (efo riro).',
    foods: [
      { name: 'Amala (yam flour swallow)', portion: '1 small wrap (180g)' },
      { name: 'Gbegiri (yellow bean soup)', portion: '1/2 ladle (80g)' },
      { name: 'Efo Riro (spinach stew)', portion: '1 ladle (150g)' },
      { name: 'Grilled Fish or Chicken', portion: '1 piece (100g)' },
    ],
    estimatedNutrients: {
      calories: 490,
      protein: 31,
      fiber: 10.2,
      carbs: 58,
      fat: 13,
      sodium: 680,
    },
    targetBenefits: [
      'Authentic cultural comfort',
      'Double fiber from yam flour & beans',
      'Loaded with iron and antioxidants',
    ],
    rationale:
      'By pairing amala with gbegiri (beans) and efo (spinach), this meal delivers substantial fiber and plant protein.',
    isNigerianInspired: true,
    prepTimeMinutes: 25,
  },
];

/**
 * Filter suggestions to strictly exclude user allergies & dietary preferences
 */
export function getTailoredSuggestions(
  preferences?: HealthPreference,
  currentSummary?: DailyNutritionSummary
): MealSuggestion[] {
  let suggestions = [...MEAL_SUGGESTION_CATALOG];

  if (preferences?.allergies && preferences.allergies.length > 0) {
    const userAllergies = new Set(preferences.allergies);
    suggestions = suggestions.filter((sug) => {
      // Check if title or foods mention allergen
      const text = `${sug.title} ${sug.description} ${sug.foods.map((f) => f.name).join(' ')}`.toLowerCase();
      if (userAllergies.has('eggs') && (text.includes('egg') || text.includes('moi moi'))) {
        return false;
      }
      if (userAllergies.has('fish') && (text.includes('fish') || text.includes('tilapia') || text.includes('catfish'))) {
        return false;
      }
      if (userAllergies.has('dairy') && (text.includes('yogurt') || text.includes('milk') || text.includes('cheese'))) {
        return false;
      }
      if (userAllergies.has('gluten') && (text.includes('wheat') || text.includes('oat') || text.includes('bread'))) {
        return false;
      }
      if (userAllergies.has('peanuts') && (text.includes('peanut') || text.includes('suya') || text.includes('groundnut'))) {
        return false;
      }
      if (userAllergies.has('shellfish') && (text.includes('shrimp') || text.includes('prawn') || text.includes('crayfish'))) {
        return false;
      }
      return true;
    });
  }

  // Dietary restrictions
  if (preferences?.dietaryRestrictions) {
    const isVegetarian = preferences.dietaryRestrictions.includes('vegetarian');
    const isVegan = preferences.dietaryRestrictions.includes('vegan');
    if (isVegan) {
      suggestions = suggestions.filter(
        (s) =>
          !s.foods.some((f) =>
            /chicken|fish|tilapia|catfish|egg|yogurt|meat|beef/i.test(f.name)
          )
      );
    } else if (isVegetarian) {
      suggestions = suggestions.filter(
        (s) =>
          !s.foods.some((f) =>
            /chicken|fish|tilapia|catfish|meat|beef/i.test(f.name)
          )
      );
    }
  }

  // Sort based on current day nutrition gap:
  // If protein is low today, put high-protein options first!
  if (currentSummary && currentSummary.targetComparison.proteinPercent < 70) {
    suggestions.sort(
      (a, b) => b.estimatedNutrients.protein - a.estimatedNutrients.protein
    );
  } else if (currentSummary && currentSummary.targetComparison.fiberPercent < 70) {
    suggestions.sort(
      (a, b) => b.estimatedNutrients.fiber - a.estimatedNutrients.fiber
    );
  }

  return suggestions;
}
