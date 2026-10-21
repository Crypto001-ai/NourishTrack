/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import {
  ActivityLevel,
  DietaryPreference,
  FoodAllergy,
  HealthCondition,
  NutritionGoal,
} from '../../types/nutrition';
import { Leaf, Check, ArrowRight, ShieldCheck, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    updateProfile,
    updateHealthPreference,
    user,
  } = useNutrition();

  const [step, setStep] = useState<number>(1);

  // Step 1: Goal & Activity
  const [primaryGoal, setPrimaryGoal] = useState<NutritionGoal>('balanced');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  // Step 2: Optional Biometrics
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState<'female' | 'male' | 'prefer_not_to_say'>('female');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');

  // Step 3: Health Conditions & Allergies
  const [conditions, setConditions] = useState<HealthCondition[]>([]);
  const [allergies, setAllergies] = useState<FoodAllergy[]>([]);
  const [dietary, setDietary] = useState<DietaryPreference>('omnivore');

  if (!isOnboardingOpen) return null;

  const handleFinish = async () => {
    try {
      await updateProfile({
        age: Number(age) || 30,
        sex,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        activityLevel,
        primaryGoal,
      });

      await updateHealthPreference({
        conditions,
        allergies,
        dietaryRestrictions: [dietary],
        educationalConsentAccepted: true,
      });
    } catch (err) {
      console.error('Error saving onboarding info:', err);
    } finally {
      setIsOnboardingOpen(false);
    }
  };

  const toggleCondition = (cond: HealthCondition) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter((c) => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const toggleAllergy = (al: FoodAllergy) => {
    if (allergies.includes(al)) {
      setAllergies(allergies.filter((a) => a !== al));
    } else {
      setAllergies([...allergies, al]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Progress Header */}
        <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
                Welcome to NourishTrack, {user?.name || 'Friend'}
              </h2>
              <p className="text-[11px] text-stone-500">Step {step} of 3 · Quick profile setup</p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="text-xs text-stone-400 hover:text-stone-700 underline"
          >
            Skip for now
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STEP 1: Goal & Activity */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-['Outfit',sans-serif]">
                  What is your primary nutrition focus?
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  We don't impose restrictive calorie diets. Pick what matters most to your routine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: 'balanced', title: 'Balanced Meals', desc: 'Sustained energy and balance' },
                  { id: 'variety', title: 'Food Variety', desc: 'Expand vegetable & whole food groups' },
                  { id: 'increase_protein', title: 'Increase Protein', desc: 'Muscle repair & prolonged fullness' },
                  { id: 'reduce_sodium', title: 'Reduce Sodium', desc: 'Mindful blood pressure support' },
                  { id: 'increase_fiber', title: 'Improve Fibre', desc: 'Digestive health & satiety' },
                  { id: 'condition_management', title: 'Condition Support', desc: 'Nutrition around health conditions' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPrimaryGoal(g.id as NutritionGoal)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      primaryGoal === g.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="block font-semibold text-xs text-stone-900">{g.title}</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">{g.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  How active are you normally?
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white"
                >
                  <option value="sedentary">Sedentary (desk work, light walking)</option>
                  <option value="light">Lightly Active (1-3 days movement)</option>
                  <option value="moderate">Moderately Active (3-5 days exercise/sports)</option>
                  <option value="active">Active (6-7 days vigorous exercise)</option>
                  <option value="very_active">Very Active (intense training / manual work)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Optional Body Metrics */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-['Outfit',sans-serif]">
                  Body Metrics & Reference Benchmarks
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  These measurements calibrate your baseline Dietary Reference Intakes (DRI). You
                  can skip them or modify them anytime.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    min="15"
                    max="110"
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Height in cm (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Weight in kg (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 68"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Health Conditions & Allergies */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-['Outfit',sans-serif]">
                  Health Considerations & Allergies
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Allows NourishTrack to highlight evidence-based parameters (e.g. sodium awareness
                  for hypertension, carb balance for diabetes).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-2">
                  Diagnosed Conditions (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'hypertension', label: 'Hypertension' },
                    { id: 'diabetes_type2', label: 'Type 2 Diabetes' },
                    { id: 'kidney_disease', label: 'Kidney Disease' },
                    { id: 'high_cholesterol', label: 'High Cholesterol' },
                  ].map((cond) => {
                    const checked = conditions.includes(cond.id as HealthCondition);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => toggleCondition(cond.id as HealthCondition)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs ${
                          checked
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{cond.label}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-2">
                  Food Allergies
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'peanuts', label: 'Peanuts (Suya spice)' },
                    { id: 'shellfish', label: 'Shellfish / Crayfish' },
                    { id: 'fish', label: 'Fish' },
                    { id: 'eggs', label: 'Eggs' },
                  ].map((al) => {
                    const checked = allergies.includes(al.id as FoodAllergy);
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => toggleAllergy(al.id as FoodAllergy)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs ${
                          checked
                            ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{al.label}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete Setup & Enter Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
