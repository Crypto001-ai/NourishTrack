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

const API_BASE = '/api';

function getStoredToken(): string | null {
  return localStorage.getItem('nourishtrack_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('nourishtrack_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('nourishtrack_token');
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
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User; profile: UserProfile; healthPreference: HealthPreference }> {
    return request('/auth/me');
  },

  // Profile
  async getProfile(): Promise<{ profile: UserProfile }> {
    return request('/profile');
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  // Health Preferences
  async getHealthPreferences(): Promise<{ healthPreference: HealthPreference }> {
    return request('/health-preferences');
  },

  async updateHealthPreferences(pref: Partial<HealthPreference>): Promise<{ healthPreference: HealthPreference }> {
    return request('/health-preferences', {
      method: 'PUT',
      body: JSON.stringify(pref),
    });
  },

  // Foods
  async getFoods(query?: string, category?: string): Promise<{ foods: FoodItem[] }> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    return request(`/foods?${params.toString()}`);
  },

  async createCustomFood(food: Partial<FoodItem>): Promise<{ food: FoodItem }> {
    return request('/foods/custom', {
      method: 'POST',
      body: JSON.stringify(food),
    });
  },

  // Meals
  async getMeals(date?: string): Promise<{ meals: MealRecord[] }> {
    const url = date ? `/meals?date=${date}` : '/meals';
    return request(url);
  },

  async createMeal(mealData: Partial<MealRecord>): Promise<{ meal: MealRecord }> {
    return request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  async updateMeal(id: string, mealData: Partial<MealRecord>): Promise<{ meal: MealRecord }> {
    return request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  },

  async deleteMeal(id: string): Promise<{ success: boolean }> {
    return request(`/meals/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  async getDailyAnalytics(date: string): Promise<{ summary: DailyNutritionSummary; insight: DailyInsight }> {
    return request(`/analytics/daily?date=${date}`);
  },

  async getWeeklyAnalytics(): Promise<{ weekly: WeeklyReportData }> {
    return request('/analytics/weekly');
  },

  // Suggestions
  async getSuggestions(date: string): Promise<{ suggestions: MealSuggestion[] }> {
    return request(`/suggestions?date=${date}`);
  },

  // AI explanation
  async getAiExplanation(date: string): Promise<{ explanation: string; deterministic?: DailyInsight }> {
    return request('/ai/nutrition-explanation', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  // Privacy
  async deleteAccount(): Promise<{ success: boolean }> {
    const res = await request<{ success: boolean }>('/account/delete', {
      method: 'DELETE',
    });
    clearStoredToken();
    return res;
  },

  getExportUrl(): string {
    const token = getStoredToken();
    return `/api/account/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};
