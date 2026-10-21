/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { MealSuggestion } from '../../types/nutrition';
import { api } from '../../services/api';
import { Sparkles, X, Check, Clock, ShieldCheck, ChevronRight, Plus } from 'lucide-react';

interface WhatShouldIEatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatShouldIEatModal: React.FC<WhatShouldIEatModalProps> = ({ isOpen, onClose }) => {
  const { currentDate, dailySummary, healthPreference, profile, setIsAddMealOpen } = useNutrition();
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getSuggestions(currentDate)
        .then((res) => {
          setSuggestions(res.suggestions || []);
          if (res.suggestions && res.suggestions.length > 0) {
            setSelectedSuggestion(res.suggestions[0]);
          }
        })
        .catch((err) => {
          console.error('Error fetching meal suggestions:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-['Outfit',sans-serif]">
                What Should I Eat?
              </h2>
              <p className="text-xs text-stone-500">
                Personalized, allergy-safe meal ideas tailored to your day's intake & health preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Day Context Banner */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div>
            <span className="font-semibold text-stone-900">Today's recorded balance: </span>
            <span className="font-mono tabular-nums">
              {dailySummary?.totalCalories || 0} kcal · {dailySummary?.totalProtein || 0}g protein ·{' '}
              {dailySummary?.totalFiber || 0}g fibre
            </span>
          </div>
          {healthPreference?.conditions && healthPreference.conditions.length > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tailored for {healthPreference.conditions.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              Analyzing daily intake and curating safe meal suggestions...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              No recommendations available matching current restrictive filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((sug) => {
                const isSelected = selectedSuggestion?.id === sug.id;
                return (
                  <div
                    key={sug.id}
                    onClick={() => setSelectedSuggestion(sug)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-xs ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                          {sug.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Clock className="w-3 h-3" /> {sug.prepTimeMinutes} mins
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900">{sug.title}</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {sug.description}
                      </p>

                      {/* Foods included */}
                      <div className="mt-3 space-y-1 text-xs">
                        {sug.foods.map((food, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span className="font-medium">{food.name}</span>
                            <span className="text-stone-400">({food.portion})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition & Why This Fits */}
                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums text-stone-600 mb-2">
                        <span>{sug.estimatedNutrients.calories} kcal</span>
                        <span>{sug.estimatedNutrients.protein}g protein</span>
                        <span>{sug.estimatedNutrients.fiber}g fibre</span>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50 text-[11px] text-stone-600 leading-snug">
                        <span className="font-semibold text-stone-900">Why this fits: </span>
                        {sug.rationale}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Suggestions prioritize accessible whole foods and authentic Nigerian staples.
          </p>
          <button
            onClick={() => {
              onClose();
              setIsAddMealOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log a Meal Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
