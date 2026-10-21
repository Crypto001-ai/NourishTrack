/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { MealCategory, MealRecord } from '../../types/nutrition';
import { AddMealModal } from './AddMealModal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Utensils,
  AlertCircle,
  FileText,
  Shield,
  Layers,
} from 'lucide-react';

export const MealJournalView: React.FC = () => {
  const {
    currentDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    meals,
    deleteMeal,
    setIsAddMealOpen,
    dailySummary,
  } = useNutrition();

  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);

  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const categoriesOrder: MealCategory[] = [
    'breakfast',
    'brunch',
    'lunch',
    'midday_snack',
    'dinner',
    'evening_snack',
    'other',
  ];

  const categoryLabels: Record<MealCategory, string> = {
    breakfast: 'Breakfast',
    brunch: 'Brunch',
    lunch: 'Lunch',
    midday_snack: 'Midday Snack',
    dinner: 'Dinner',
    evening_snack: 'Evening Snack',
    other: 'Other / Beverage',
  };

  const handleDelete = async (mealId: string, name: string) => {
    if (confirm(`Are you sure you want to delete this ${name} record?`)) {
      await deleteMeal(mealId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Daily Meal Journal</span>
            <span>·</span>
            <span>Multi-Food Logging</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif] mt-0.5">
            {formattedDate}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-2xs">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                isToday ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={goToNextDay}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingMeal(null);
              setIsAddMealOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Daily Snapshot Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums text-stone-700">
        <div className="flex items-center gap-2 font-sans font-semibold text-stone-900">
          <Utensils className="w-4 h-4 text-emerald-700" />
          <span>Day's Total ({meals.length} meals):</span>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <span>
            <strong className="text-stone-900 font-bold">{dailySummary?.totalCalories || 0}</strong>{' '}
            kcal
          </span>
          <span>
            <strong className="text-stone-900 font-bold">{dailySummary?.totalProtein || 0}g</strong>{' '}
            protein
          </span>
          <span>
            <strong className="text-stone-900 font-bold">{dailySummary?.totalCarbs || 0}g</strong>{' '}
            carbs
          </span>
          <span>
            <strong className="text-stone-900 font-bold">{dailySummary?.totalFat || 0}g</strong> fat
          </span>
          <span>
            <strong className="text-emerald-800 font-bold">{dailySummary?.totalFiber || 0}g</strong>{' '}
            fibre
          </span>
          <span>
            <strong className="text-stone-900 font-bold">{dailySummary?.totalSodium || 0}mg</strong>{' '}
            sodium
          </span>
        </div>
      </div>

      {/* Main Meal Timeline by Category */}
      {meals.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-stone-200 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900 font-['Outfit',sans-serif]">
            No Meals Logged For This Date
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Whether you had a quick snack or a traditional Nigerian feast (like Jollof, Efo Riro, or
            Amala), logging your food takes only a few taps and reveals your authentic nutrient
            balance.
          </p>
          <button
            onClick={() => {
              setEditingMeal(null);
              setIsAddMealOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record a Meal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesOrder.map((cat) => {
            const catMeals = meals.filter((m) => m.category === cat);
            if (catMeals.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-700" />
                    <span>{categoryLabels[cat]}</span>
                  </h2>
                  <span className="text-xs text-stone-500 font-mono tabular-nums">
                    {catMeals.reduce((acc, m) => acc + m.totalCalories, 0)} kcal total
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {catMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4"
                    >
                      {/* Meal Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {meal.time}
                          </span>
                          {meal.notes && (
                            <span className="text-xs text-stone-500 italic bg-stone-50 px-2 py-0.5 rounded">
                              "{meal.notes}"
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono tabular-nums text-xs">
                            <span className="font-bold text-sm text-stone-900">
                              {meal.totalCalories} kcal
                            </span>
                            <span className="text-stone-500 block">
                              {meal.totalProtein}g P · {meal.totalCarbs}g C · {meal.totalFat}g F ·{' '}
                              {meal.totalFiber}g Fib
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingMeal(meal)}
                              className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                              title="Edit meal"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(meal.id, categoryLabels[cat])}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete meal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items Table within this meal */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[10px]">
                              <th className="py-1.5 font-semibold">Food Item</th>
                              <th className="py-1.5 font-semibold">Portion & Qty</th>
                              <th className="py-1.5 font-semibold text-right">Calories</th>
                              <th className="py-1.5 font-semibold text-right">Protein</th>
                              <th className="py-1.5 font-semibold text-right">Carbs</th>
                              <th className="py-1.5 font-semibold text-right">Fat</th>
                              <th className="py-1.5 font-semibold text-right">Fibre</th>
                              <th className="py-1.5 font-semibold text-right">Sodium</th>
                              <th className="py-1.5 font-semibold text-right">Source</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                            {meal.items.map((item) => (
                              <tr key={item.id} className="hover:bg-stone-50/50">
                                <td className="py-2.5 font-sans font-medium text-stone-900 pr-2">
                                  {item.foodName}
                                </td>
                                <td className="py-2.5 text-stone-600 font-sans">
                                  {item.quantity} × {item.portionUnit}
                                </td>
                                <td className="py-2.5 text-right font-bold text-stone-900">
                                  {item.calculatedCalories}
                                </td>
                                <td className="py-2.5 text-right text-stone-600">
                                  {item.calculatedProtein}g
                                </td>
                                <td className="py-2.5 text-right text-stone-600">
                                  {item.calculatedCarbs}g
                                </td>
                                <td className="py-2.5 text-right text-stone-600">
                                  {item.calculatedFat}g
                                </td>
                                <td className="py-2.5 text-right text-emerald-800 font-medium">
                                  {item.calculatedFiber}g
                                </td>
                                <td className="py-2.5 text-right text-stone-600">
                                  {item.calculatedSodium}mg
                                </td>
                                <td className="py-2.5 text-right text-[10px] text-stone-400 font-sans truncate max-w-[140px]">
                                  {item.dataSource}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal (when editingMeal is non-null) */}
      {editingMeal && (
        <AddMealModal
          isOpen={true}
          onClose={() => setEditingMeal(null)}
          initialMealToEdit={editingMeal}
        />
      )}
    </div>
  );
};
