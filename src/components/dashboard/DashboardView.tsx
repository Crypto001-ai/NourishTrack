/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNutrition } from '../../context/NutritionContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Utensils,
  Flame,
  Scale,
  Leaf,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    profile,
    healthPreference,
    currentDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    meals,
    dailySummary,
    dailyInsight,
    setIsAddMealOpen,
    setIsWhatToEatOpen,
    setActivePage,
  } = useNutrition();

  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const calTarget = profile?.targetCalories || 2000;
  const currentCal = dailySummary?.totalCalories || 0;
  const calPercent = Math.min(100, Math.round((currentCal / calTarget) * 100));

  const protTarget = profile?.targetProteinG || 75;
  const currentProt = dailySummary?.totalProtein || 0;
  const protPercent = Math.min(100, Math.round((currentProt / protTarget) * 100));

  const carbTarget = profile?.targetCarbsG || 250;
  const currentCarb = dailySummary?.totalCarbs || 0;
  const carbPercent = Math.min(100, Math.round((currentCarb / carbTarget) * 100));

  const fatTarget = profile?.targetFatG || 65;
  const currentFat = dailySummary?.totalFat || 0;
  const fatPercent = Math.min(100, Math.round((currentFat / fatTarget) * 100));

  const fiberTarget = profile?.targetFiberG || 28;
  const currentFiber = dailySummary?.totalFiber || 0;
  const fiberPercent = Math.min(100, Math.round((currentFiber / fiberTarget) * 100));

  const maxSodium = profile?.maxSodiumMg || 2300;
  const currentSodium = dailySummary?.totalSodium || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Date Navigator & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Daily Record</span>
            <span>·</span>
            <span>{isToday ? 'Today' : 'Historical Date'}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif] mt-0.5">
            {formattedDate}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Day Navigator */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-2xs">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                isToday ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={goToNextDay}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsWhatToEatOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>What to Eat?</span>
          </button>

          <button
            onClick={() => setIsAddMealOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Welcome & Goal Banner */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
              Welcome back
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500 capitalize">
              Goal: {profile?.primaryGoal?.replace('_', ' ') || 'Balanced Nutrition'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-0.5">
            {user?.name || 'Friend'}, here is your daily nutritional balance
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            {meals.length === 0
              ? 'No meals recorded yet today. Logging your breakfast, lunch, or snack will populate your daily macro and micronutrient breakdown.'
              : `You have logged ${meals.length} meal(s) today. Your choices are analyzed deterministically using certified USDA & Nigerian composition tables.`}
          </p>
        </div>

        {healthPreference?.conditions && healthPreference.conditions.length > 0 && (
          <div className="shrink-0 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs max-w-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Health Considerations Active</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Guidance tailored for{' '}
              <span className="font-medium text-stone-700 capitalize">
                {healthPreference.conditions.join(', ')}
              </span>
              . Educational only.
            </p>
          </div>
        )}
      </div>

      {/* Main KPI Row: Calorie Ring & Macro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Calorie Card: 4 cols */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="uppercase tracking-wider font-semibold">Energy Intake</span>
              <span className="font-mono tabular-nums">
                Target: {calTarget} kcal
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
                {currentCal}
              </span>
              <span className="text-sm font-medium text-stone-500">kcal</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {currentCal < calTarget
                ? `${calTarget - currentCal} kcal remaining to reach reference target`
                : `${currentCal - calTarget} kcal over reference target`}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono tabular-nums">
              <span>{calPercent}% of daily goal</span>
              <span>{meals.length} meal(s) logged</span>
            </div>
          </div>
        </div>

        {/* Core Macronutrients: 8 cols */}
        <div className="md:col-span-8 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-4">
              <span className="uppercase tracking-wider font-semibold">
                Core Macronutrients & Fibre
              </span>
              <span className="text-stone-400">Deterministic DRI Calculations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Protein */}
              <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-100 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                  Protein
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {currentProt}
                  </span>
                  <span className="text-xs text-stone-400">/ {protTarget}g</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${protPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-mono tabular-nums block">
                  {protPercent}% target
                </span>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-100 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                  Carbohydrates
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {currentCarb}
                  </span>
                  <span className="text-xs text-stone-400">/ {carbTarget}g</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${carbPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-mono tabular-nums block">
                  {carbPercent}% target
                </span>
              </div>

              {/* Fat */}
              <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-100 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                  Total Fat
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {currentFat}
                  </span>
                  <span className="text-xs text-stone-400">/ {fatTarget}g</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-600 rounded-full transition-all"
                    style={{ width: `${fatPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-mono tabular-nums block">
                  {fatPercent}% target
                </span>
              </div>

              {/* Fiber */}
              <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-100 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                  Dietary Fibre
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
                    {currentFiber}
                  </span>
                  <span className="text-xs text-stone-400">/ {fiberTarget}g</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all"
                    style={{ width: `${fiberPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-700 font-mono tabular-nums block">
                  {fiberPercent}% target
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Micronutrient Strip: Sodium & Sugar */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-sans">Sodium:</span>
              <span className="font-semibold text-stone-900">{currentSodium}mg</span>
              <span className="text-stone-400">/ max {maxSodium}mg</span>
              {currentSodium > maxSodium ? (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-sans">
                  Elevated
                </span>
              ) : (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                  Within limits
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-sans">Added Sugar:</span>
              <span className="font-semibold text-stone-900">
                {dailySummary?.totalAddedSugar || 0}g
              </span>
              <span className="text-stone-400">/ max {profile?.maxAddedSugarG || 35}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Recorded Meals (7 cols) + Daily Insight Teaser (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Meals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 font-['Outfit',sans-serif]">
              Meals Recorded Today ({meals.length})
            </h3>
            <button
              onClick={() => setActivePage('journal')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View Full Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {meals.length === 0 ? (
            <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                <Utensils className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-stone-900">No meals logged for this date</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Track breakfast, lunch, snacks, or dinner to see your real nutrient breakdown.
              </p>
              <button
                onClick={() => setIsAddMealOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log First Meal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          {meal.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {meal.time}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 mt-1">
                        {meal.items.map((i) => i.foodName).join(', ')}
                      </p>
                    </div>

                    <div className="text-right font-mono tabular-nums">
                      <span className="text-sm font-bold text-stone-900">
                        {meal.totalCalories} kcal
                      </span>
                      <span className="block text-[11px] text-stone-500">
                        {meal.totalProtein}g P · {meal.totalFiber}g Fib
                      </span>
                    </div>
                  </div>

                  {/* Food items mini-list */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-[11px] text-stone-600">
                    {meal.items.map((item) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 rounded bg-stone-50 border border-stone-200/60 font-medium"
                      >
                        {item.foodName} ({item.quantity}× {item.portionUnit})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Daily Insight Snapshot */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 font-['Outfit',sans-serif]">
              Personalized Nutrition Insight
            </h3>
            <button
              onClick={() => setActivePage('insights')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
            {/* What Went Well */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>What Went Well</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-1 pl-6 list-disc">
                {(dailyInsight?.whatWentWell || [
                  'Consistent meal recording reveals your authentic habits.',
                ]).map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What Could Improve */}
            <div className="space-y-1.5 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                <Info className="w-4 h-4 text-amber-700" />
                <span>What Could Improve</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-1 pl-6 list-disc">
                {(dailyInsight?.whatCouldImprove || [
                  'Track all meals including drinks to establish nutrient totals.',
                ]).map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Suggested Swap */}
            {dailyInsight?.suggestedImprovements && dailyInsight.suggestedImprovements.length > 0 && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                <span className="font-semibold text-emerald-950">
                  {dailyInsight.suggestedImprovements[0].title}
                </span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {dailyInsight.suggestedImprovements[0].action}
                </p>
              </div>
            )}

            {/* Data Confidence Notice */}
            <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>{dailyInsight?.dataConfidenceExplanation || 'Values from verified tables.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
