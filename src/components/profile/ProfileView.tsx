/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import {
  ActivityLevel,
  FoodAllergy,
  HealthCondition,
  NutritionGoal,
} from '../../types/nutrition';
import { api } from '../../services/api';
import {
  User as UserIcon,
  Shield,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Heart,
  Scale,
  Award,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, profile, healthPreference, updateProfile, updateHealthPreference, logout } =
    useNutrition();

  // Profile fields state
  const [age, setAge] = useState<number>(profile?.age || 30);
  const [sex, setSex] = useState<'female' | 'male' | 'prefer_not_to_say'>(
    profile?.sex || 'female'
  );
  const [heightCm, setHeightCm] = useState<string>(
    profile?.heightCm ? String(profile.heightCm) : ''
  );
  const [weightKg, setWeightKg] = useState<string>(
    profile?.weightKg ? String(profile.weightKg) : ''
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel || 'moderate'
  );
  const [primaryGoal, setPrimaryGoal] = useState<NutritionGoal>(
    profile?.primaryGoal || 'balanced'
  );

  // Health considerations state
  const [conditions, setConditions] = useState<HealthCondition[]>(
    healthPreference?.conditions || []
  );
  const [allergies, setAllergies] = useState<FoodAllergy[]>(
    healthPreference?.allergies || []
  );
  const [dietaryNotes, setDietaryNotes] = useState<string>(
    healthPreference?.notes || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
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
        notes: dietaryNotes,
        educationalConsentAccepted: true,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCondition = (cond: HealthCondition) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter((c) => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const toggleAllergy = (allergy: FoodAllergy) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'Are you sure you want to permanently delete your account and all meal records? This action is irreversible.'
      )
    ) {
      setIsDeleting(true);
      try {
        await api.deleteAccount();
        logout();
      } catch (err) {
        console.error('Failed to delete account:', err);
        alert('Could not delete account. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExportData = () => {
    api.downloadClientExport();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif]">
          Profile & Health Preferences
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Customize your nutritional reference targets, recorded health considerations, and
          privacy controls.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Biometrics & Goal */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-stone-900 font-['Outfit',sans-serif]">
              Personal Nutrition Goals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Primary Nutrition Goal
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as NutritionGoal)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="balanced">Eat more balanced meals (Default)</option>
                <option value="variety">Improve dietary & plant variety</option>
                <option value="increase_protein">Increase protein intake</option>
                <option value="reduce_sodium">Reduce excess sodium (DASH)</option>
                <option value="increase_fiber">Improve daily dietary fibre</option>
                <option value="condition_management">Manage nutrition around condition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="sedentary">Sedentary (mostly desk work)</option>
                <option value="light">Lightly Active (1-3 days light movement)</option>
                <option value="moderate">Moderately Active (3-5 days exercise)</option>
                <option value="active">Active (6-7 days vigorous activity)</option>
                <option value="very_active">Very Active (physical job or athlete)</option>
              </select>
            </div>
          </div>

          {/* Optional Body Metrics */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-700">
                Body Metrics (Used to calculate DRI targets; entirely optional)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  min="16"
                  max="120"
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">
                  Height in cm (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">
                  Weight in kg (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 68"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Health Conditions & Allergies */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-stone-900 font-['Outfit',sans-serif]">
                Recorded Health Considerations & Allergies
              </h2>
              <p className="text-xs text-stone-500">
                Helps tailor educational guidance. NourishTrack never predicts disease or alters
                medications.
              </p>
            </div>
          </div>

          {/* Conditions checkboxes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Diagnosed Health Conditions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'hypertension', label: 'Hypertension (High BP)' },
                { id: 'diabetes_type2', label: 'Type 2 Diabetes' },
                { id: 'diabetes_type1', label: 'Type 1 Diabetes' },
                { id: 'kidney_disease', label: 'Chronic Kidney Disease' },
                { id: 'high_cholesterol', label: 'High Cholesterol' },
                { id: 'gerd', label: 'Acid Reflux / GERD' },
              ].map((cond) => {
                const checked = conditions.includes(cond.id as HealthCondition);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id as HealthCondition)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      checked
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cond.label}</span>
                    {checked && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies checkboxes */}
          <div className="pt-3 border-t border-stone-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Food Allergies & Intolerances (Cross-checked during meal logging)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'peanuts', label: 'Peanuts (Suya spice)' },
                { id: 'shellfish', label: 'Shellfish / Crayfish' },
                { id: 'fish', label: 'Fish & Seafood' },
                { id: 'eggs', label: 'Eggs (Moi Moi/Baking)' },
                { id: 'dairy', label: 'Dairy / Cow Milk' },
                { id: 'gluten', label: 'Gluten / Wheat' },
              ].map((al) => {
                const checked = allergies.includes(al.id as FoodAllergy);
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => toggleAllergy(al.id as FoodAllergy)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      checked
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-semibold'
                        : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{al.label}</span>
                    {checked && <Check className="w-4 h-4 text-amber-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save button and feedback */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences updated successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Section 3: Privacy, Data Export & Deletion */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-stone-600" />
          <div>
            <h2 className="text-base font-bold text-stone-900 font-['Outfit',sans-serif]">
              Data Privacy & Security Center
            </h2>
            <p className="text-xs text-stone-500">
              Your nutritional entries belong to you. We do not sell or monetize personal health
              information.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <span className="font-semibold text-stone-800 block">Export Personal Meal Records</span>
            <span className="text-stone-500 text-[11px]">
              Download your complete profile and meal history as a structured JSON archive.
            </span>
          </div>
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs">
          <div>
            <span className="font-semibold text-red-950 block">Permanent Account & Data Wipe</span>
            <span className="text-red-700/80 text-[11px]">
              Irreversibly delete your account, credentials, health considerations, and all logged meals.
            </span>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
