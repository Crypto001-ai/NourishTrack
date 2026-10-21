/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DailyInsight,
  DailyNutritionSummary,
  HealthPreference,
  MealRecord,
  User,
  UserProfile,
  WeeklyReportData,
} from '../types/nutrition';
import { api, clearStoredToken } from '../services/api';
import {
  calculateDailySummary,
  calculateReferenceTargets,
  generateDailyInsight,
  generateWeeklyReport,
} from '../utils/nutritionEngine';

interface NutritionContextType {
  user: User | null;
  profile: UserProfile | null;
  healthPreference: HealthPreference | null;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  meals: MealRecord[];
  allMeals: MealRecord[];
  dailySummary: DailyNutritionSummary | null;
  dailyInsight: DailyInsight | null;
  weeklyReport: WeeklyReportData | null;
  loading: boolean;
  activePage: 'landing' | 'dashboard' | 'journal' | 'insights' | 'reports' | 'profile';
  setActivePage: (page: 'landing' | 'dashboard' | 'journal' | 'insights' | 'reports' | 'profile') => void;
  isAddMealOpen: boolean;
  setIsAddMealOpen: (open: boolean) => void;
  isWhatToEatOpen: boolean;
  setIsWhatToEatOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => void;
  addMeal: (mealData: Partial<MealRecord>) => Promise<MealRecord>;
  editMeal: (id: string, mealData: Partial<MealRecord>) => Promise<MealRecord>;
  deleteMeal: (id: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateHealthPreference: (data: Partial<HealthPreference>) => Promise<void>;
  refreshDailyData: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [healthPreference, setHealthPreference] = useState<HealthPreference | null>(null);

  const getLocalDateString = () => new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString);

  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [allMeals, setAllMeals] = useState<MealRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<'landing' | 'dashboard' | 'journal' | 'insights' | 'reports' | 'profile'>('dashboard');

  const [isAddMealOpen, setIsAddMealOpen] = useState<boolean>(false);
  const [isWhatToEatOpen, setIsWhatToEatOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Load user session on mount
  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setHealthPreference(data.healthPreference);
    } catch (err) {
      console.warn('Session init failed, user will see landing or demo login:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Load meals & analytics whenever user or currentDate changes
  const refreshDailyData = useCallback(async () => {
    if (!user) return;
    try {
      const [dayMealsRes, allMealsRes, analyticsRes, weeklyRes] = await Promise.all([
        api.getMeals(currentDate).catch(() => ({ meals: [] })),
        api.getMeals().catch(() => ({ meals: [] })),
        api.getDailyAnalytics(currentDate).catch(() => null),
        api.getWeeklyAnalytics().catch(() => null),
      ]);

      setMeals(dayMealsRes.meals || []);
      setAllMeals(allMealsRes.meals || []);

      if (analyticsRes) {
        setDailySummary(analyticsRes.summary);
        setDailyInsight(analyticsRes.insight);
      } else if (profile) {
        const sum = calculateDailySummary(currentDate, dayMealsRes.meals || [], profile);
        setDailySummary(sum);
        setDailyInsight(generateDailyInsight(sum, profile, healthPreference || undefined));
      }

      if (weeklyRes) {
        setWeeklyReport(weeklyRes.weekly);
      } else if (profile) {
        setWeeklyReport(generateWeeklyReport(allMealsRes.meals || [], profile, 7));
      }
    } catch (err) {
      console.error('Error refreshing nutrition data:', err);
    }
  }, [user, currentDate, profile, healthPreference]);

  useEffect(() => {
    if (user) {
      refreshDailyData();
    }
  }, [user, currentDate, refreshDailyData]);

  // Date navigation helpers
  const goToPreviousDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(getLocalDateString());
  };

  // Auth methods
  const login = async (email: string) => {
    setLoading(true);
    try {
      await api.login(email);
      await initSession();
      setActivePage('dashboard');
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string) => {
    setLoading(true);
    try {
      await api.register(name, email);
      await initSession();
      setIsAuthModalOpen(false);
      setIsOnboardingOpen(true);
      setActivePage('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setProfile(null);
    setHealthPreference(null);
    setMeals([]);
    setAllMeals([]);
    setActivePage('landing');
  };

  // Meal Operations
  const addMeal = async (mealData: Partial<MealRecord>): Promise<MealRecord> => {
    const res = await api.createMeal({
      ...mealData,
      date: mealData.date || currentDate,
    });
    await refreshDailyData();
    return res.meal;
  };

  const editMeal = async (id: string, mealData: Partial<MealRecord>): Promise<MealRecord> => {
    const res = await api.updateMeal(id, mealData);
    await refreshDailyData();
    return res.meal;
  };

  const deleteMeal = async (id: string): Promise<void> => {
    await api.deleteMeal(id);
    await refreshDailyData();
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    const res = await api.updateProfile(data);
    setProfile(res.profile);
    await refreshDailyData();
  };

  const updateHealthPreference = async (data: Partial<HealthPreference>): Promise<void> => {
    const res = await api.updateHealthPreferences(data);
    setHealthPreference(res.healthPreference);
    await refreshDailyData();
  };

  return (
    <NutritionContext.Provider
      value={{
        user,
        profile,
        healthPreference,
        currentDate,
        setCurrentDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        meals,
        allMeals,
        dailySummary,
        dailyInsight,
        weeklyReport,
        loading,
        activePage,
        setActivePage,
        isAddMealOpen,
        setIsAddMealOpen,
        isWhatToEatOpen,
        setIsWhatToEatOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        login,
        register,
        logout,
        addMeal,
        editMeal,
        deleteMeal,
        updateProfile,
        updateHealthPreference,
        refreshDailyData,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}
