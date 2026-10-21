/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyInsight,
  DailyNutritionSummary,
  FoodItem,
  HealthPreference,
  MealRecord,
  MealSuggestion,
  User,
  UserProfile,
  WeeklyReportData,
} from '../types/nutrition';
import { localStore } from './localStore';

const API_BASE = '/api';

function getStoredToken(): string | null {
  return localStorage.getItem('nourishtrack_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('nourishtrack_token', token);
  localStore.setCurrentUserId(token);
}

export function clearStoredToken() {
  localStorage.removeItem('nourishtrack_token');
  localStore.clearCurrentUserId();
}

function isFallbackError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err);
  return (
    msg.includes('404') ||
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('ECONNREFUSED')
  );
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    try {
      const data = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStoredToken(data.token);
      return data;
    } catch (err) {
      if (isFallbackError(err)) {
        const local = localStore.login(email);
        setStoredToken(local.token);
        return local;
      }
      throw err;
    }
  },

  async register(name: string, email: string): Promise<{ user: User; token: string }> {
    try {
      const data = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      });
      setStoredToken(data.token);
      return data;
    } catch (err) {
      if (isFallbackError(err)) {
        const local = localStore.register(name, email);
        setStoredToken(local.token);
        return local;
      }
      throw err;
    }
  },

  async getMe(): Promise<{ user: User; profile: UserProfile; healthPreference: HealthPreference }> {
    try {
      return await request('/auth/me');
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getMe();
      }
      throw err;
    }
  },

  // Profile
  async getProfile(): Promise<{ profile: UserProfile }> {
    try {
      return await request('/profile');
    } catch (err) {
      if (isFallbackError(err)) {
        return { profile: localStore.getMe().profile };
      }
      throw err;
    }
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    try {
      return await request('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.updateProfile(profile);
      }
      throw err;
    }
  },

  // Health Preferences
  async getHealthPreferences(): Promise<{ healthPreference: HealthPreference }> {
    try {
      return await request('/health-preferences');
    } catch (err) {
      if (isFallbackError(err)) {
        return { healthPreference: localStore.getMe().healthPreference };
      }
      throw err;
    }
  },

  async updateHealthPreferences(pref: Partial<HealthPreference>): Promise<{ healthPreference: HealthPreference }> {
    try {
      return await request('/health-preferences', {
        method: 'PUT',
        body: JSON.stringify(pref),
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.updateHealthPreferences(pref);
      }
      throw err;
    }
  },

  // Foods
  async getFoods(query?: string, category?: string): Promise<{ foods: FoodItem[] }> {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);
      return await request(`/foods?${params.toString()}`);
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getFoods(query, category);
      }
      throw err;
    }
  },

  async createCustomFood(food: Partial<FoodItem>): Promise<{ food: FoodItem }> {
    try {
      return await request('/foods/custom', {
        method: 'POST',
        body: JSON.stringify(food),
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.createCustomFood(food);
      }
      throw err;
    }
  },

  // Meals
  async getMeals(date?: string): Promise<{ meals: MealRecord[] }> {
    try {
      const url = date ? `/meals?date=${date}` : '/meals';
      return await request(url);
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getMeals(date);
      }
      throw err;
    }
  },

  async createMeal(mealData: Partial<MealRecord>): Promise<{ meal: MealRecord }> {
    try {
      return await request('/meals', {
        method: 'POST',
        body: JSON.stringify(mealData),
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.createMeal(mealData);
      }
      throw err;
    }
  },

  async updateMeal(id: string, mealData: Partial<MealRecord>): Promise<{ meal: MealRecord }> {
    try {
      return await request(`/meals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mealData),
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.updateMeal(id, mealData);
      }
      throw err;
    }
  },

  async deleteMeal(id: string): Promise<{ success: boolean }> {
    try {
      return await request(`/meals/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.deleteMeal(id);
      }
      throw err;
    }
  },

  // Analytics
  async getDailyAnalytics(date: string): Promise<{ summary: DailyNutritionSummary; insight: DailyInsight }> {
    try {
      return await request(`/analytics/daily?date=${date}`);
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getDailyAnalytics(date);
      }
      throw err;
    }
  },

  async getWeeklyAnalytics(): Promise<{ weekly: WeeklyReportData }> {
    try {
      return await request('/analytics/weekly');
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getWeeklyAnalytics();
      }
      throw err;
    }
  },

  // Suggestions
  async getSuggestions(date: string): Promise<{ suggestions: MealSuggestion[] }> {
    try {
      return await request(`/suggestions?date=${date}`);
    } catch (err) {
      if (isFallbackError(err)) {
        return localStore.getSuggestions(date);
      }
      throw err;
    }
  },

  // AI explanation
  async getAiExplanation(date: string): Promise<{ explanation: string; deterministic?: DailyInsight }> {
    try {
      return await request('/ai/nutrition-explanation', {
        method: 'POST',
        body: JSON.stringify({ date }),
      });
    } catch (err) {
      // Deterministic supportive synthesis
      const local = localStore.getDailyAnalytics(date);
      const points = local.insight.whatWentWell.concat(local.insight.whatCouldImprove).join('\n\n');
      return {
        explanation: `Here is a summary of your recorded intake for ${date}:\n\n${points}\n\nContinue tracking to discover your long-term patterns!`,
        deterministic: local.insight,
      };
    }
  },

  // Privacy
  async deleteAccount(): Promise<{ success: boolean }> {
    try {
      const res = await request<{ success: boolean }>('/account/delete', {
        method: 'DELETE',
      });
      clearStoredToken();
      return res;
    } catch (err) {
      const res = localStore.deleteAccount();
      clearStoredToken();
      return res;
    }
  },

  getExportUrl(): string {
    const token = getStoredToken();
    return `/api/account/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  downloadClientExport() {
    const data = localStore.getMe();
    const meals = localStore.getMeals();
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: data.user,
      profile: data.profile,
      healthPreference: data.healthPreference,
      meals: meals.meals,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nourishtrack-data-${data.user.email}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
