/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_FOOD_DATABASE } from './src/data/foodDatabase.ts';
import {
  calculateDailySummary,
  calculateReferenceTargets,
  generateDailyInsight,
  generateWeeklyReport,
  getTailoredSuggestions,
} from './src/utils/nutritionEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini client on the server
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// File-based database path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nourishtrack-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store initialized from disk or default seed
interface DbState {
  users: any[];
  profiles: Record<string, any>;
  healthPreferences: Record<string, any>;
  customFoods: any[];
  meals: any[];
}

function getInitialDbState(): DbState {
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

  // Past dates for sample weekly data
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const sampleMeals = [
    // Today: Breakfast
    {
      id: 'meal_today_1',
      userId: defaultUserId,
      category: 'breakfast',
      date: today,
      time: '08:30',
      notes: 'Light breakfast before work',
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
      notes: 'Balanced lunch with colleagues',
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
    // Yesterday: Breakfast
    {
      id: 'meal_yest_1',
      userId: defaultUserId,
      category: 'breakfast',
      date: daysAgo(1),
      time: '08:15',
      items: [
        {
          id: 'item_y1_1',
          foodId: 'f_usda_oatmeal',
          foodName: 'Rolled Oats (cooked)',
          portionUnit: '1 cup (234g)',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 166,
          calculatedProtein: 5.9,
          calculatedCarbs: 28.1,
          calculatedFat: 3.6,
          calculatedFiber: 4.0,
          calculatedSodium: 9,
          calculatedAddedSugar: 0,
          dataSource: 'USDA FDC #173904',
          dataQuality: 'verified_composition',
          foodGroup: 'whole_grains',
        },
        {
          id: 'item_y1_2',
          foodId: 'f_usda_boiled_egg',
          foodName: 'Whole Boiled Egg',
          portionUnit: '1 large',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 78,
          calculatedProtein: 6.3,
          calculatedCarbs: 0.6,
          calculatedFat: 5.3,
          calculatedFiber: 0,
          calculatedSodium: 62,
          calculatedAddedSugar: 0,
          dataSource: 'USDA FDC #171287',
          dataQuality: 'verified_composition',
          foodGroup: 'protein_foods',
        },
        {
          id: 'item_y1_3',
          foodId: 'f_usda_banana',
          foodName: 'Fresh Banana',
          portionUnit: '1 medium',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 105,
          calculatedProtein: 1.3,
          calculatedCarbs: 27.0,
          calculatedFat: 0.4,
          calculatedFiber: 3.1,
          calculatedSodium: 1,
          calculatedAddedSugar: 0,
          dataSource: 'USDA FDC #173944',
          dataQuality: 'verified_composition',
          foodGroup: 'fruits',
        },
      ],
      totalCalories: 349,
      totalProtein: 13.5,
      totalCarbs: 55.7,
      totalFat: 9.3,
      totalFiber: 7.1,
      totalSodium: 72,
      totalAddedSugar: 0,
    },
    // Yesterday: Lunch
    {
      id: 'meal_yest_2',
      userId: defaultUserId,
      category: 'lunch',
      date: daysAgo(1),
      time: '13:00',
      items: [
        {
          id: 'item_y2_1',
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
          id: 'item_y2_2',
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
          id: 'item_y2_3',
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
    // Yesterday: Dinner
    {
      id: 'meal_yest_3',
      userId: defaultUserId,
      category: 'dinner',
      date: daysAgo(1),
      time: '19:30',
      items: [
        {
          id: 'item_y3_1',
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
          id: 'item_y3_2',
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
    // 3 days ago: Lunch & Dinner
    {
      id: 'meal_3d_1',
      userId: defaultUserId,
      category: 'lunch',
      date: daysAgo(3),
      time: '12:45',
      items: [
        {
          id: 'item_3d_1',
          foodId: 'f_ng_ewa_aganyin',
          foodName: 'Ewa Aganyin (Mashed honey beans)',
          portionUnit: '1 cup',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 295,
          calculatedProtein: 14.5,
          calculatedCarbs: 38.0,
          calculatedFat: 9.8,
          calculatedFiber: 10.5,
          calculatedSodium: 410,
          calculatedAddedSugar: 0,
          dataSource: 'NFCT 2017',
          dataQuality: 'verified_composition',
          foodGroup: 'legumes',
        },
        {
          id: 'item_3d_2',
          foodId: 'f_usda_boiled_egg',
          foodName: 'Boiled Egg',
          portionUnit: '1 large',
          quantity: 1,
          servingMultiplier: 1,
          calculatedCalories: 78,
          calculatedProtein: 6.3,
          calculatedCarbs: 0.6,
          calculatedFat: 5.3,
          calculatedFiber: 0,
          calculatedSodium: 62,
          calculatedAddedSugar: 0,
          dataSource: 'USDA',
          dataQuality: 'verified_composition',
          foodGroup: 'protein_foods',
        },
      ],
      totalCalories: 373,
      totalProtein: 20.8,
      totalCarbs: 38.6,
      totalFat: 15.1,
      totalFiber: 10.5,
      totalSodium: 472,
      totalAddedSugar: 0,
    },
  ];

  return {
    users: [
      {
        id: defaultUserId,
        name: 'Abdullahi Adeniran',
        email: 'adeniranabdullahi358@gmail.com',
        passwordHash: 'demo_hash_pwd',
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
        notes:
          'Focusing on mindful sodium levels, ample dietary fiber, and authentic balanced Nigerian staples.',
      },
    },
    customFoods: [],
    meals: sampleMeals,
  };
}

let db: DbState = (() => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }
  const initial = getInitialDbState();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial DB:', err);
  }
  return initial;
})();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Simple session helper: returns the user object from Bearer token or demo fallback
function resolveUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = db.users.find((u) => u.id === token || u.email === token);
    if (user) return user;
  }
  // Return the default demo user if available
  return db.users[0] || null;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'NourishTrack API', timestamp: new Date().toISOString() });
});

// Auth: Login / Register / Me / Demo Login
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    email: email.toLowerCase(),
    passwordHash: 'hashed_' + (password || 'default'),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Initialize profile with sensible DRI targets
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

  saveDb();

  res.json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token: newUser.id,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // If logging in with demo or email, create clean session
    user = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email.toLowerCase(),
      passwordHash: 'demo',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const initialTargets = calculateReferenceTargets({});
    db.profiles[user.id] = {
      userId: user.id,
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
    db.healthPreferences[user.id] = {
      userId: user.id,
      conditions: [],
      allergies: [],
      dietaryRestrictions: ['omnivore'],
      educationalConsentAccepted: true,
    };
    saveDb();
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: user.id,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    profile: db.profiles[user.id] || null,
    healthPreference: db.healthPreferences[user.id] || null,
  });
});

// Profile endpoints
app.get('/api/profile', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.profiles[user.id] || null;
  res.json({ profile });
});

app.put('/api/profile', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const existing = db.profiles[user.id] || { userId: user.id };
  const updatedData = { ...existing, ...req.body, userId: user.id };

  // Recalculate DRI targets if user updated biometrics or goal
  const targets = calculateReferenceTargets(updatedData);
  updatedData.targetCalories = updatedData.targetCalories || targets.calories;
  updatedData.targetProteinG = updatedData.targetProteinG || targets.protein;
  updatedData.targetCarbsG = updatedData.targetCarbsG || targets.carbs;
  updatedData.targetFatG = updatedData.targetFatG || targets.fat;
  updatedData.targetFiberG = updatedData.targetFiberG || targets.fiber;
  updatedData.maxSodiumMg = updatedData.maxSodiumMg || targets.sodiumMax;
  updatedData.maxAddedSugarG = updatedData.maxAddedSugarG || targets.addedSugarMax;

  db.profiles[user.id] = updatedData;
  saveDb();
  res.json({ profile: updatedData });
});

// Health Preferences endpoints
app.get('/api/health-preferences', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const healthPref = db.healthPreferences[user.id] || null;
  res.json({ healthPreference: healthPref });
});

app.put('/api/health-preferences', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const existing = db.healthPreferences[user.id] || { userId: user.id };
  const updated = { ...existing, ...req.body, userId: user.id };
  db.healthPreferences[user.id] = updated;
  saveDb();
  res.json({ healthPreference: updated });
});

// Foods database search & custom food creation
app.get('/api/foods', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.category as string || '').toLowerCase().trim();

  let foods = [...INITIAL_FOOD_DATABASE, ...db.customFoods];

  if (category && category !== 'all') {
    foods = foods.filter((f) => f.category === category || f.foodGroup === category);
  }

  if (query) {
    foods = foods.filter((f) => {
      const matchName = f.name.toLowerCase().includes(query);
      const matchLocal = f.localName?.toLowerCase().includes(query);
      const matchTag = (f.tags || []).some((t: string) => t.toLowerCase().includes(query));
      return matchName || matchLocal || matchTag;
    });
  }

  res.json({ foods });
});

app.post('/api/foods/custom', (req, res) => {
  const user = resolveUser(req);
  const data = req.body;
  if (!data.name || !data.servingUnit) {
    return res.status(400).json({ error: 'Food name and serving unit are required.' });
  }

  const customFood = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name,
    localName: data.localName || undefined,
    category: data.category || 'grains_tubers',
    servingUnit: data.servingUnit,
    servingGrams: Number(data.servingGrams) || 100,
    calories: Number(data.calories) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fat: Number(data.fat) || 0,
    fiber: Number(data.fiber) || 0,
    sodium: Number(data.sodium) || 0,
    addedSugar: Number(data.addedSugar) || 0,
    foodGroup: data.foodGroup || 'whole_grains',
    dataSource: 'User Custom Entry (Label Marked)',
    dataQuality: 'estimate',
    allergens: data.allergens || [],
    tags: ['custom', ...(data.tags || [])],
    isCustom: true,
    createdBy: user ? user.id : 'anonymous',
  };

  db.customFoods.push(customFood);
  saveDb();
  res.json({ food: customFood });
});

// Meals CRUD
app.get('/api/meals', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const date = req.query.date as string;
  let userMeals = db.meals.filter((m) => m.userId === user.id);

  if (date) {
    userMeals = userMeals.filter((m) => m.date === date);
  }

  // Sort by time
  userMeals.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  res.json({ meals: userMeals });
});

app.post('/api/meals', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { category, date, time, items, notes } = req.body;
  if (!category || !date || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Category, date, and at least one food item are required.' });
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalAddedSugar = 0;

  const processedItems = items.map((it: any) => {
    const qty = Number(it.quantity) || 1;
    const itemCal = Math.round(Number(it.calculatedCalories) || 0);
    const itemProt = Math.round((Number(it.calculatedProtein) || 0) * 10) / 10;
    const itemCarb = Math.round((Number(it.calculatedCarbs) || 0) * 10) / 10;
    const itemFat = Math.round((Number(it.calculatedFat) || 0) * 10) / 10;
    const itemFib = Math.round((Number(it.calculatedFiber) || 0) * 10) / 10;
    const itemSod = Math.round(Number(it.calculatedSodium) || 0);
    const itemSugar = Math.round((Number(it.calculatedAddedSugar) || 0) * 10) / 10;

    totalCalories += itemCal;
    totalProtein += itemProt;
    totalCarbs += itemCarb;
    totalFat += itemFat;
    totalFiber += itemFib;
    totalSodium += itemSod;
    totalAddedSugar += itemSugar;

    return {
      id: it.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodId: it.foodId,
      foodName: it.foodName,
      portionUnit: it.portionUnit,
      quantity: qty,
      servingMultiplier: it.servingMultiplier || qty,
      preparationMethod: it.preparationMethod,
      calculatedCalories: itemCal,
      calculatedProtein: itemProt,
      calculatedCarbs: itemCarb,
      calculatedFat: itemFat,
      calculatedFiber: itemFib,
      calculatedSodium: itemSod,
      calculatedAddedSugar: itemSugar,
      dataSource: it.dataSource || 'Verified Food Database',
      dataQuality: it.dataQuality || 'verified_composition',
      foodGroup: it.foodGroup || 'whole_grains',
    };
  });

  const newMeal = {
    id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    category,
    date,
    time: time || new Date().toTimeString().slice(0, 5),
    items: processedItems,
    notes: notes || '',
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
  saveDb();

  res.status(201).json({ meal: newMeal });
});

app.put('/api/meals/:id', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const mealIndex = db.meals.findIndex((m) => m.id === req.params.id && m.userId === user.id);
  if (mealIndex === -1) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  const { category, date, time, items, notes } = req.body;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalAddedSugar = 0;

  const processedItems = (items || []).map((it: any) => {
    const itemCal = Math.round(Number(it.calculatedCalories) || 0);
    const itemProt = Math.round((Number(it.calculatedProtein) || 0) * 10) / 10;
    const itemCarb = Math.round((Number(it.calculatedCarbs) || 0) * 10) / 10;
    const itemFat = Math.round((Number(it.calculatedFat) || 0) * 10) / 10;
    const itemFib = Math.round((Number(it.calculatedFiber) || 0) * 10) / 10;
    const itemSod = Math.round(Number(it.calculatedSodium) || 0);
    const itemSugar = Math.round((Number(it.calculatedAddedSugar) || 0) * 10) / 10;

    totalCalories += itemCal;
    totalProtein += itemProt;
    totalCarbs += itemCarb;
    totalFat += itemFat;
    totalFiber += itemFib;
    totalSodium += itemSod;
    totalAddedSugar += itemSugar;

    return {
      ...it,
      id: it.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      calculatedCalories: itemCal,
      calculatedProtein: itemProt,
      calculatedCarbs: itemCarb,
      calculatedFat: itemFat,
      calculatedFiber: itemFib,
      calculatedSodium: itemSod,
      calculatedAddedSugar: itemSugar,
    };
  });

  const updatedMeal = {
    ...db.meals[mealIndex],
    category: category || db.meals[mealIndex].category,
    date: date || db.meals[mealIndex].date,
    time: time || db.meals[mealIndex].time,
    items: processedItems,
    notes: notes !== undefined ? notes : db.meals[mealIndex].notes,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    totalSodium: Math.round(totalSodium),
    totalAddedSugar: Math.round(totalAddedSugar * 10) / 10,
    updatedAt: new Date().toISOString(),
  };

  db.meals[mealIndex] = updatedMeal;
  saveDb();

  res.json({ meal: updatedMeal });
});

app.delete('/api/meals/:id', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const initialLength = db.meals.length;
  db.meals = db.meals.filter((m) => !(m.id === req.params.id && m.userId === user.id));

  if (db.meals.length === initialLength) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  saveDb();
  res.json({ success: true, message: 'Meal deleted' });
});

// Analytics & Insights
app.get('/api/analytics/daily', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const profile = db.profiles[user.id] || {
    userId: user.id,
    targetCalories: 2000,
    targetProteinG: 75,
    targetCarbsG: 250,
    targetFatG: 65,
    targetFiberG: 28,
    maxSodiumMg: 2300,
    maxAddedSugarG: 35,
  };

  const userMeals = db.meals.filter((m) => m.userId === user.id);
  const summary = calculateDailySummary(date, userMeals, profile);
  const healthPref = db.healthPreferences[user.id];
  const insight = generateDailyInsight(summary, profile, healthPref);

  res.json({ summary, insight });
});

app.get('/api/analytics/weekly', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const profile = db.profiles[user.id] || {
    userId: user.id,
    targetCalories: 2000,
    targetProteinG: 75,
    targetCarbsG: 250,
    targetFatG: 65,
    targetFiberG: 28,
    maxSodiumMg: 2300,
  };

  const userMeals = db.meals.filter((m) => m.userId === user.id);
  const weekly = generateWeeklyReport(userMeals, profile, 7);

  res.json({ weekly });
});

// What Should I Eat suggestions
app.get('/api/suggestions', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const profile = db.profiles[user.id];
  const healthPref = db.healthPreferences[user.id];
  const userMeals = db.meals.filter((m) => m.userId === user.id);
  const summary = calculateDailySummary(date, userMeals, profile);

  const suggestions = getTailoredSuggestions(healthPref, summary);
  res.json({ suggestions });
});

// AI-Assisted Nutrition Explanation (Gemini 3.8 Flash)
app.post('/api/ai/nutrition-explanation', async (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const profile = db.profiles[user.id];
  const healthPref = db.healthPreferences[user.id];
  const userMeals = db.meals.filter((m) => m.userId === user.id && m.date === targetDate);
  const summary = calculateDailySummary(targetDate, userMeals, profile);

  if (!ai) {
    // Graceful fallback to deterministic insight if API key not injected
    const deterministicInsight = generateDailyInsight(summary, profile, healthPref);
    return res.json({
      explanation: deterministicInsight.whatWentWell.concat(deterministicInsight.whatCouldImprove).join(' '),
      deterministic: deterministicInsight,
    });
  }

  try {
    const mealTitles = userMeals.map((m) => `${m.category}: ${m.items.map((i: any) => i.foodName).join(', ')}`).join('; ');
    const prompt = `You are a warm, supportive, evidence-based nutrition educator.
Review the following daily nutrition record for a user named ${user.name}:
- Date: ${targetDate}
- Meals consumed: ${mealTitles || 'No meals logged yet'}
- Total Calories: ${summary.totalCalories} kcal (Target: ${profile.targetCalories || 2000})
- Protein: ${summary.totalProtein}g (Target: ${profile.targetProteinG || 75}g)
- Fiber: ${summary.totalFiber}g (Target: ${profile.targetFiberG || 28}g)
- Sodium: ${summary.totalSodium}mg (Ceiling: ${profile.maxSodiumMg || 2300}mg)
- Food groups represented: ${summary.foodGroupsRepresented.join(', ')}
- Recorded conditions: ${healthPref?.conditions?.join(', ') || 'None'}
- Allergies to respect: ${healthPref?.allergies?.join(', ') || 'None'}

Instructions:
1. Provide a concise, supportive 2-3 paragraph summary.
2. Highlight 1 positive observation and 1 gentle, realistic improvement (e.g. adding Nigerian leafy greens, steamed moi moi, or boiling instead of deep-frying).
3. Do NOT diagnose any disease, do NOT predict diabetes or future illness, and do NOT prescribe medical drug changes.
4. Keep the tone encouraging, non-judgmental, and practical.`;

    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: prompt,
    });

    res.json({
      explanation: response.text || 'Keep tracking your daily meals for balanced insights.',
    });
  } catch (err: any) {
    console.error('Gemini explanation error:', err);
    const deterministicInsight = generateDailyInsight(summary, profile, healthPref);
    res.json({
      explanation: deterministicInsight.whatWentWell.concat(deterministicInsight.whatCouldImprove).join(' '),
      deterministic: deterministicInsight,
    });
  }
});

// Privacy & Data export
app.get('/api/account/export', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, name: user.name, email: user.email },
    profile: db.profiles[user.id] || null,
    healthPreferences: db.healthPreferences[user.id] || null,
    meals: db.meals.filter((m) => m.userId === user.id),
    customFoods: db.customFoods.filter((f) => f.createdBy === user.id),
  };

  res.setHeader('Content-Disposition', 'attachment; filename="nourishtrack-user-data.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exportData, null, 2));
});

// Privacy & Permanent Data deletion
app.delete('/api/account/delete', (req, res) => {
  const user = resolveUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  db.meals = db.meals.filter((m) => m.userId !== user.id);
  delete db.profiles[user.id];
  delete db.healthPreferences[user.id];
  db.customFoods = db.customFoods.filter((f) => f.createdBy !== user.id);
  db.users = db.users.filter((u) => u.id !== user.id);

  saveDb();
  res.json({ success: true, message: 'All personal nutrition and health data has been permanently deleted.' });
});

// ----------------------------------------------------
// FRONTEND SERVER / VITE MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NourishTrack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
