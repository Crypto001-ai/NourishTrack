/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_FOOD_DATABASE } from '../data/foodDatabase';
import {
  DailyInsight,
  DailyNutritionSummary,
  FoodItem,
  HealthPreference,
  MealCategory,
  MealRecord,
  MealRecordItem,
  MealSuggestion,
  User,
  UserProfile,
  WeeklyReportData,
} from '../types/nutrition';
import {
  calculateDailySummary,
  calculateReferenceTargets,
  generateDailyInsight,
  generateWeeklyReport,
  getTailoredSuggestions,
} from '../utils/nutritionEngine';

const STORAGE_KEY = 'nourishtrack_local_db_v1';
const CURRENT_USER_KEY = 'nourishtrack_current_user_id';

interface LocalDatabaseState {
  users: User[];
  profiles: Record<string, UserProfile>;
  healthPreferences: Record<string, HealthPreference>;
  customFoods: FoodItem[];
  meals: MealRecord[];
}

function getInitialState(): LocalDatabaseState {
  const defaultUserId = 'user_demo_1';
  const defaultTargets = calculateReferenceTargets({
    age: 31,
    sex: 'female',
    weightKg: 68,
    heightCm: 168,
    activityLevel: 'moderate',
    primaryGoal: 'balanced',
  });

  const today = new Date().toISOString().split('T')[0];
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const sampleMeals: MealRecord[] = [
    // Today: Breakfast
    {
      id: 'meal_today_1',
      userId: defaultUserId,
      category: 'breakfast',
      date: today,
      time: '08:30',
      notes: 'Light traditional breakfast',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item_t1_1',
          foodId: 'f_ng_pap_akamu',
          foodName: 'Pap / Ogi / Akamu (fermented maize pudding)',
          portionUnit: '1 bowl / cup (240ml)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 110,
          calculatedProtein: 2.2,
          calculatedCarbs: 23.5,
          calculatedFat: 0.8,
          calculatedFiber: 1.4,
          calculatedSodium: 15,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT Fermented Cereal Data',
          dataQuality: 'verified_composition',
          foodGroup: 'whole_grains',
        },
        {
          id: 'item_t1_2',
          foodId: 'f_ng_akara',
          foodName: 'Akara (Fried bean fritters)',
          portionUnit: '3 medium pieces (90g)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 215,
          calculatedProtein: 8.5,
          calculatedCarbs: 18.0,
          calculatedFat: 12.5,
          calculatedFiber: 4.2,
          calculatedSodium: 290,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'legumes',
        },
        {
          id: 'item_t1_3',
          foodId: 'f_usda_water',
          foodName: 'Drinking Water',
          portionUnit: '1 glass (250ml)',
          quantity: 2,
          servingMultiplier: 2,
          calculatedCalories: 0,
          calculatedProtein: 0,
          calculatedCarbs: 0,
          calculatedFat: 0,
          calculatedFiber: 0,
          calculatedSodium: 10,
          calculatedAddedSugar: 0,
          dataSource: 'USDA Standard Reference',
          dataQuality: 'verified_composition',
          foodGroup: 'healthy_fats',
        },
      ],
      totalCalories: 325,
      totalProtein: 10.7,
      totalCarbs: 41.5,
      totalFat: 13.3,
      totalFiber: 5.6,
      totalSodium: 315,
      totalAddedSugar: 0,
    },
    // Today: Lunch
    {
      id: 'meal_today_2',
      userId: defaultUserId,
      category: 'lunch',
      date: today,
      time: '13:15',
      notes: 'Balanced West African lunch',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item_t2_1',
          foodId: 'f_ng_jollof_rice',
          foodName: 'Jollof Rice (Nigerian style)',
          portionUnit: '1 cup (200g)',
          quantity: 1.5,
          servingMultiplier: 1.5,
          calculatedCalories: 428,
          calculatedProtein: 8.1,
          calculatedCarbs: 72.0,
          calculatedFat: 12.8,
          calculatedFiber: 4.2,
          calculatedSodium: 720,
          calculatedAddedSugar: 0.8,
          dataSource: 'NFCT Standardized Recipe',
          dataQuality: 'standardized_recipe',
          foodGroup: 'refined_grains',
        },
        {
          id: 'item_t2_2',
          foodId: 'f_ng_grilled_chicken',
          foodName: 'Nigerian Spiced Grilled Chicken',
          portionUnit: '1 medium piece (120g)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 235,
          calculatedProtein: 30.5,
          calculatedCarbs: 1.5,
          calculatedFat: 11.5,
          calculatedFiber: 0.3,
          calculatedSodium: 380,
          calculatedAddedSugar: 0,
          dataSource: 'USDA / NFCT Poultry',
          dataQuality: 'verified_composition',
          foodGroup: 'protein_foods',
        },
        {
          id: 'item_t2_3',
          foodId: 'f_ng_efo_riro',
          foodName: 'Efo Riro (Rich Spinach & Pepper Stew)',
          portionUnit: '1 ladle (160g)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 165,
          calculatedProtein: 9.8,
          calculatedCarbs: 7.2,
          calculatedFat: 11.0,
          calculatedFiber: 4.8,
          calculatedSodium: 420,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017 Leafy Vegetable',
          dataQuality: 'verified_composition',
          foodGroup: 'vegetables',
        },
        {
          id: 'item_t2_4',
          foodId: 'f_ng_fried_plantain_dodo',
          foodName: 'Fried Ripe Plantain (Dodo)',
          portionUnit: '1/2 cup (100g)',
          quantity: 0.7,
          servingMultiplier: 0.7,
          calculatedCalories: 147,
          calculatedProtein: 0.8,
          calculatedCarbs: 23.8,
          calculatedFat: 6.0,
          calculatedFiber: 1.6,
          calculatedSodium: 32,
          calculatedAddedSugar: 0,
          dataSource: 'USDA / NFCT Plantain',
          dataQuality: 'verified_composition',
          foodGroup: 'tubers_roots',
        },
      ],
      totalCalories: 975,
      totalProtein: 49.2,
      totalCarbs: 104.5,
      totalFat: 41.3,
      totalFiber: 10.9,
      totalSodium: 1552,
      totalAddedSugar: 0.8,
    },
    // Yesterday: Lunch & Dinner
    {
      id: 'meal_yest_1',
      userId: defaultUserId,
      category: 'lunch',
      date: daysAgo(1),
      time: '13:00',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item_y1_1',
          foodId: 'f_ng_ofada_rice',
          foodName: 'Ofada Rice (unpolished brown rice)',
          portionUnit: '1 cup (195g)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 220,
          calculatedProtein: 5.0,
          calculatedCarbs: 46.5,
          calculatedFat: 1.8,
          calculatedFiber: 4.1,
          calculatedSodium: 15,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'whole_grains',
        },
        {
          id: 'item_y1_2',
          foodId: 'f_ng_efo_riro',
          foodName: 'Efo Riro (Spinach stew)',
          portionUnit: '1 ladle',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 165,
          calculatedProtein: 9.8,
          calculatedCarbs: 7.2,
          calculatedFat: 11.0,
          calculatedFiber: 4.8,
          calculatedSodium: 420,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'vegetables',
        },
        {
          id: 'item_y1_3',
          foodId: 'f_ng_fried_fish_tilapia',
          foodName: 'Seasoned Tilapia Fish',
          portionUnit: '1 piece',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 215,
          calculatedProtein: 27.0,
          calculatedCarbs: 0.8,
          calculatedFat: 11.2,
          calculatedFiber: 0,
          calculatedSodium: 340,
          calculatedAddedSugar: 0,
          dataSource: 'USDA / NFCT',
          dataQuality: 'verified_composition',
          foodGroup: 'protein_foods',
        },
      ],
      totalCalories: 600,
      totalProtein: 41.8,
      totalCarbs: 54.5,
      totalFat: 24.0,
      totalFiber: 8.9,
      totalSodium: 775,
      totalAddedSugar: 0,
    },
    {
      id: 'meal_yest_2',
      userId: defaultUserId,
      category: 'dinner',
      date: daysAgo(1),
      time: '19:30',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item_y2_1',
          foodId: 'f_ng_moi_moi',
          foodName: 'Moi Moi (Steamed bean pudding)',
          portionUnit: '1 wrap',
          quantity: 1.5,
          servingMultiplier: 1.5,
          calculatedCalories: 293,
          calculatedProtein: 17.7,
          calculatedCarbs: 33.8,
          calculatedFat: 10.2,
          calculatedFiber: 8.7,
          calculatedSodium: 510,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'legumes',
        },
        {
          id: 'item_y2_2',
          foodId: 'f_ng_boiled_plantain',
          foodName: 'Boiled Ripe Plantain',
          portionUnit: '1 medium',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 165,
          calculatedProtein: 1.5,
          calculatedCarbs: 41.0,
          calculatedFat: 0.3,
          calculatedFiber: 3.6,
          calculatedSodium: 5,
          calculatedAddedSugar: 0,
          dataSource: 'USDA FDC #167761',
          dataQuality: 'verified_composition',
          foodGroup: 'tubers_roots',
        },
      ],
      totalCalories: 458,
      totalProtein: 19.2,
      totalCarbs: 74.8,
      totalFat: 10.5,
      totalFiber: 12.3,
      totalSodium: 515,
      totalAddedSugar: 0,
    },
    // 2 days ago: Lunch
    {
      id: 'meal_2d_1',
      userId: defaultUserId,
      category: 'lunch',
      date: daysAgo(2),
      time: '13:30',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item_2d_1',
          foodId: 'f_ng_amala',
          foodName: 'Amala (Yam flour swallow)',
          portionUnit: '1 wrap',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 245,
          calculatedProtein: 2.9,
          calculatedCarbs: 56.0,
          calculatedFat: 0.6,
          calculatedFiber: 6.2,
          calculatedSodium: 18,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'tubers_roots',
        },
        {
          id: 'item_2d_2',
          foodId: 'f_ng_egusi_soup',
          foodName: 'Egusi Soup with Spinach',
          portionUnit: '1 ladle',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 275,
          calculatedProtein: 11.5,
          calculatedCarbs: 6.8,
          calculatedFat: 23.0,
          calculatedFiber: 3.5,
          calculatedSodium: 490,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'standardized_recipe',
          foodGroup: 'healthy_fats',
        },
        {
          id: 'item_2d_3',
          foodId: 'f_ng_grilled_chicken',
          foodName: 'Grilled Chicken',
          portionUnit: '1 piece',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 235,
          calculatedProtein: 30.5,
          calculatedCarbs: 1.5,
          calculatedFat: 11.5,
          calculatedFiber: 0.3,
          calculatedSodium: 380,
          calculatedAddedSugar: 0,
          dataSource: 'USDA / NFCT',
          dataQuality: 'verified_composition',
          foodGroup: 'protein_foods',
        },
      ],
      totalCalories: 755,
      totalProtein: 44.9,
      totalCarbs: 64.3,
      totalFat: 35.1,
      totalFiber: 10.0,
      totalSodium: 888,
      totalAddedSugar: 0,
    },
  ];

  return {
    users: [
      {
        id: defaultUserId,
        name: 'Abdullahi Adeniran',
        email: 'adeniranabdullahi358@gmail.com',
        createdAt: new Date().toISOString(),
      },
    ],
    profiles: {
      [defaultUserId]: {
        userId: defaultUserId,
        age: 31,
        sex: 'female',
        heightCm: 168,
        weightKg: 68,
        activityLevel: 'moderate',
        primaryGoal: 'balanced',
        targetCalories: defaultTargets.calories,
        targetProteinG: defaultTargets.protein,
        targetCarbsG: defaultTargets.carbs,
        targetFatG: defaultTargets.fat,
        targetFiberG: defaultTargets.fiber,
        maxSodiumMg: 2000,
        maxAddedSugarG: defaultTargets.addedSugarMax,
      },
    },
    healthPreferences: {
      [defaultUserId]: {
        userId: defaultUserId,
        conditions: ['hypertension'],
        allergies: [],
        dietaryRestrictions: ['omnivore'],
        educationalConsentAccepted: true,
        notes: 'Focusing on mindful sodium levels and authentic balanced meals.',
      },
    },
    customFoods: [],
    meals: sampleMeals,
  };
}

function loadDb(): LocalDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load local DB:', err);
  }
  const initial = getInitialState();
  saveDb(initial);
  return initial;
}

function saveDb(state: LocalDatabaseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save local DB:', err);
  }
}

export const localStore = {
  getCurrentUserId(): string {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) return stored;
    const db = loadDb();
    const defaultId = db.users[0]?.id || 'user_demo_1';
    localStorage.setItem(CURRENT_USER_KEY, defaultId);
    return defaultId;
  },

  setCurrentUserId(id: string) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  },

  clearCurrentUserId() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  register(name: string, email: string): { user: User; token: string } {
    const db = loadDb();
    const cleanEmail = email.toLowerCase().trim();
    let existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      this.setCurrentUserId(existing.id);
      return { user: existing, token: existing.id };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    const initialTargets = calculateReferenceTargets({ age: 30, sex: 'female', weightKg: 68 });
    db.profiles[newUser.id] = {
      userId: newUser.id,
      age: 30,
      sex: 'female',
      activityLevel: 'moderate',
      primaryGoal: 'balanced',
      targetCalories: initialTargets.calories,
      targetProteinG: initialTargets.protein,
      targetCarbsG: initialTargets.carbs,
      targetFatG: initialTargets.fat,
      targetFiberG: initialTargets.fiber,
      maxSodiumMg: initialTargets.sodiumMax,
      maxAddedSugarG: initialTargets.addedSugarMax,
    };

    db.healthPreferences[newUser.id] = {
      userId: newUser.id,
      conditions: [],
      allergies: [],
      dietaryRestrictions: ['omnivore'],
      educationalConsentAccepted: true,
    };

    saveDb(db);
    this.setCurrentUserId(newUser.id);
    return { user: newUser, token: newUser.id };
  },

  login(email: string): { user: User; token: string } {
    const db = loadDb();
    const cleanEmail = email.toLowerCase().trim();
    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return this.register(email.split('@')[0], email);
    }

    this.setCurrentUserId(user.id);
    return { user, token: user.id };
  },

  getMe(): { user: User; profile: UserProfile; healthPreference: HealthPreference } {
    const db = loadDb();
    const currentId = this.getCurrentUserId();
    let user = db.users.find((u) => u.id === currentId) || db.users[0];

    if (!user) {
      const reg = this.register('Abdullahi Adeniran', 'adeniranabdullahi358@gmail.com');
      user = reg.user;
    }

    const profile = db.profiles[user.id] || {
      userId: user.id,
      age: 30,
      sex: 'female',
      activityLevel: 'moderate',
      primaryGoal: 'balanced',
      targetCalories: 2000,
      targetProteinG: 75,
      targetCarbsG: 250,
      targetFatG: 65,
      targetFiberG: 28,
      maxSodiumMg: 2300,
      maxAddedSugarG: 35,
    };

    const healthPreference = db.healthPreferences[user.id] || {
      userId: user.id,
      conditions: [],
      allergies: [],
      dietaryRestrictions: ['omnivore'],
      educationalConsentAccepted: true,
    };

    return { user, profile, healthPreference };
  },

  updateProfile(profileData: Partial<UserProfile>): { profile: UserProfile } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const existing = db.profiles[userId] || { userId };
    const updated = { ...existing, ...profileData, userId };

    const targets = calculateReferenceTargets(updated);
    updated.targetCalories = updated.targetCalories || targets.calories;
    updated.targetProteinG = updated.targetProteinG || targets.protein;
    updated.targetCarbsG = updated.targetCarbsG || targets.carbs;
    updated.targetFatG = updated.targetFatG || targets.fat;
    updated.targetFiberG = updated.targetFiberG || targets.fiber;
    updated.maxSodiumMg = updated.maxSodiumMg || targets.sodiumMax;
    updated.maxAddedSugarG = updated.maxAddedSugarG || targets.addedSugarMax;

    db.profiles[userId] = updated;
    saveDb(db);
    return { profile: updated };
  },

  updateHealthPreferences(prefData: Partial<HealthPreference>): { healthPreference: HealthPreference } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const existing = db.healthPreferences[userId] || { userId };
    const updated = { ...existing, ...prefData, userId };
    db.healthPreferences[userId] = updated;
    saveDb(db);
    return { healthPreference: updated };
  },

  getFoods(query?: string, category?: string): { foods: FoodItem[] } {
    const db = loadDb();
    let foods = [...INITIAL_FOOD_DATABASE, ...db.customFoods];
    const q = (query || '').toLowerCase().trim();
    const cat = (category || '').toLowerCase().trim();

    if (cat && cat !== 'all') {
      foods = foods.filter((f) => f.category === cat || f.foodGroup === cat);
    }
    if (q) {
      foods = foods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.localName?.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return { foods };
  },

  createCustomFood(foodData: Partial<FoodItem>): { food: FoodItem } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const newFood: FoodItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: foodData.name || 'Custom Food',
      localName: foodData.localName,
      category: foodData.category || 'grains_tubers',
      servingUnit: foodData.servingUnit || '1 portion (150g)',
      servingGrams: Number(foodData.servingGrams) || 150,
      calories: Number(foodData.calories) || 0,
      protein: Number(foodData.protein) || 0,
      carbs: Number(foodData.carbs) || 0,
      fat: Number(foodData.fat) || 0,
      fiber: Number(foodData.fiber) || 0,
      sodium: Number(foodData.sodium) || 0,
      addedSugar: Number(foodData.addedSugar) || 0,
      foodGroup: foodData.foodGroup || 'whole_grains',
      dataSource: 'User Custom Entry (Label Marked)',
      dataQuality: 'estimate',
      allergens: foodData.allergens || [],
      tags: ['custom', ...(foodData.tags || [])],
      isCustom: true,
    };

    db.customFoods.push(newFood);
    saveDb(db);
    return { food: newFood };
  },

  getMeals(date?: string): { meals: MealRecord[] } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    let userMeals = db.meals.filter((m) => m.userId === userId);
    if (date) {
      userMeals = userMeals.filter((m) => m.date === date);
    }
    userMeals.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    return { meals: userMeals };
  },

  createMeal(mealData: Partial<MealRecord>): { meal: MealRecord } {
    const db = loadDb();
    const userId = this.getCurrentUserId();

    const items = (mealData.items || []).map((it) => {
      const qty = Number(it.quantity) || 1;
      return {
        ...it,
        id: it.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quantity: qty,
        servingMultiplier: it.servingMultiplier || qty,
        calculatedCalories: Math.round(Number(it.calculatedCalories) || 0),
        calculatedProtein: Math.round((Number(it.calculatedProtein) || 0) * 10) / 10,
        calculatedCarbs: Math.round((Number(it.calculatedCarbs) || 0) * 10) / 10,
        calculatedFat: Math.round((Number(it.calculatedFat) || 0) * 10) / 10,
        calculatedFiber: Math.round((Number(it.calculatedFiber) || 0) * 10) / 10,
        calculatedSodium: Math.round(Number(it.calculatedSodium) || 0),
        calculatedAddedSugar: Math.round((Number(it.calculatedAddedSugar) || 0) * 10) / 10,
      };
    });

    const totalCalories = items.reduce((acc, i) => acc + i.calculatedCalories, 0);
    const totalProtein = items.reduce((acc, i) => acc + i.calculatedProtein, 0);
    const totalCarbs = items.reduce((acc, i) => acc + i.calculatedCarbs, 0);
    const totalFat = items.reduce((acc, i) => acc + i.calculatedFat, 0);
    const totalFiber = items.reduce((acc, i) => acc + i.calculatedFiber, 0);
    const totalSodium = items.reduce((acc, i) => acc + i.calculatedSodium, 0);
    const totalAddedSugar = items.reduce((acc, i) => acc + i.calculatedAddedSugar, 0);

    const newMeal: MealRecord = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      category: mealData.category || 'lunch',
      date: mealData.date || new Date().toISOString().split('T')[0],
      time: mealData.time || new Date().toTimeString().slice(0, 5),
      items,
      notes: mealData.notes || '',
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalSodium: Math.round(totalSodium),
      totalAddedSugar: Math.round(totalAddedSugar * 10) / 10,
      createdAt: new Date().toISOString(),
    };

    db.meals.push(newMeal);
    saveDb(db);
    return { meal: newMeal };
  },

  updateMeal(id: string, mealData: Partial<MealRecord>): { meal: MealRecord } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const idx = db.meals.findIndex((m) => m.id === id && m.userId === userId);
    if (idx === -1) {
      throw new Error('Meal not found');
    }

    const items = (mealData.items || []).map((it) => ({
      ...it,
      id: it.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      calculatedCalories: Math.round(Number(it.calculatedCalories) || 0),
      calculatedProtein: Math.round((Number(it.calculatedProtein) || 0) * 10) / 10,
      calculatedCarbs: Math.round((Number(it.calculatedCarbs) || 0) * 10) / 10,
      calculatedFat: Math.round((Number(it.calculatedFat) || 0) * 10) / 10,
      calculatedFiber: Math.round((Number(it.calculatedFiber) || 0) * 10) / 10,
      calculatedSodium: Math.round(Number(it.calculatedSodium) || 0),
      calculatedAddedSugar: Math.round((Number(it.calculatedAddedSugar) || 0) * 10) / 10,
    }));

    const totalCalories = items.reduce((acc, i) => acc + i.calculatedCalories, 0);
    const totalProtein = items.reduce((acc, i) => acc + i.calculatedProtein, 0);
    const totalCarbs = items.reduce((acc, i) => acc + i.calculatedCarbs, 0);
    const totalFat = items.reduce((acc, i) => acc + i.calculatedFat, 0);
    const totalFiber = items.reduce((acc, i) => acc + i.calculatedFiber, 0);
    const totalSodium = items.reduce((acc, i) => acc + i.calculatedSodium, 0);
    const totalAddedSugar = items.reduce((acc, i) => acc + i.calculatedAddedSugar, 0);

    const updatedMeal: MealRecord = {
      ...db.meals[idx],
      category: mealData.category || db.meals[idx].category,
      date: mealData.date || db.meals[idx].date,
      time: mealData.time || db.meals[idx].time,
      items,
      notes: mealData.notes !== undefined ? mealData.notes : db.meals[idx].notes,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalSodium: Math.round(totalSodium),
      totalAddedSugar: Math.round(totalAddedSugar * 10) / 10,
    };

    db.meals[idx] = updatedMeal;
    saveDb(db);
    return { meal: updatedMeal };
  },

  deleteMeal(id: string): { success: boolean } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    db.meals = db.meals.filter((m) => !(m.id === id && m.userId === userId));
    saveDb(db);
    return { success: true };
  },

  getDailyAnalytics(date: string): { summary: DailyNutritionSummary; insight: DailyInsight } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const profile = db.profiles[userId] || {
      userId,
      targetCalories: 2000,
      targetProteinG: 75,
      targetCarbsG: 250,
      targetFatG: 65,
      targetFiberG: 28,
      maxSodiumMg: 2300,
      maxAddedSugarG: 35,
    };
    const userMeals = db.meals.filter((m) => m.userId === userId);
    const summary = calculateDailySummary(date, userMeals, profile as UserProfile);
    const healthPref = db.healthPreferences[userId];
    const insight = generateDailyInsight(summary, profile as UserProfile, healthPref);

    return { summary, insight };
  },

  getWeeklyAnalytics(): { weekly: WeeklyReportData } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const profile = db.profiles[userId] || {
      userId,
      targetCalories: 2000,
      targetProteinG: 75,
      targetCarbsG: 250,
      targetFatG: 65,
      targetFiberG: 28,
      maxSodiumMg: 2300,
      maxAddedSugarG: 35,
    };
    const userMeals = db.meals.filter((m) => m.userId === userId);
    const weekly = generateWeeklyReport(userMeals, profile as UserProfile, 7);
    return { weekly };
  },

  getSuggestions(date: string): { suggestions: MealSuggestion[] } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    const profile = db.profiles[userId];
    const healthPref = db.healthPreferences[userId];
    const userMeals = db.meals.filter((m) => m.userId === userId);
    const summary = calculateDailySummary(date, userMeals, profile as UserProfile);
    const suggestions = getTailoredSuggestions(healthPref, summary);
    return { suggestions };
  },

  deleteAccount(): { success: boolean } {
    const db = loadDb();
    const userId = this.getCurrentUserId();
    db.meals = db.meals.filter((m) => m.userId !== userId);
    delete db.profiles[userId];
    delete db.healthPreferences[userId];
    db.users = db.users.filter((u) => u.id !== userId);
    saveDb(db);
    this.clearCurrentUserId();
    return { success: true };
  },
};
