/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { api } from '../../services/api';
import {
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Heart,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const NutritionInsightsView: React.FC = () => {
  const {
    currentDate,
    dailySummary,
    dailyInsight,
    profile,
    healthPreference,
    meals,
    setIsWhatToEatOpen,
  } = useNutrition();

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleGenerateAiExplanation = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.getAiExplanation(currentDate);
      setAiExplanation(res.explanation);
    } catch (err) {
      console.error('Error getting AI explanation:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Daily Nutrition Review</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif] mt-0.5">
            Nutrition Insights & Guidance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWhatToEatOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>What Should I Eat?</span>
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Clinical Notice Banner */}
      <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200/90 text-xs text-stone-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-900">
            Educational Dietary Philosophy & Non-Judgmental Guidance
          </p>
          <p className="leading-relaxed">
            NourishTrack analyzes food patterns using established nutritional science (USDA &
            Nigerian Food Composition Tables). We never diagnose medical conditions, predict
            future disease probability from single-day logs, or assign guilt. One day of eating is
            simply one piece of a broader, lifelong journey.
          </p>
        </div>
      </div>

      {/* 4 Core Pillars of Daily Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. What Went Well */}
        <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
                What Went Well
              </h2>
              <span className="text-[11px] text-stone-500">Positive nutritional patterns</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed pt-2">
            {(dailyInsight?.whatWentWell || [
              'Logging your daily meals builds sustainable nutritional awareness.',
            ]).map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. What Could Improve */}
        <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100/70 flex items-center justify-center text-amber-800">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
                What Could Improve
              </h2>
              <span className="text-[11px] text-stone-500">Constructive, supportive feedback</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed pt-2">
            {(dailyInsight?.whatCouldImprove || [
              'Continue recording meals to highlight micronutrient opportunities.',
            ]).map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Actionable Realistic Suggested Improvements */}
      <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100/70 flex items-center justify-center text-teal-800">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
              Suggested Practical Adjustments
            </h2>
            <span className="text-[11px] text-stone-500">
              Realistic, culturally relevant food swaps & additions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {(dailyInsight?.suggestedImprovements || []).map((sug, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2"
            >
              <h3 className="font-semibold text-xs text-stone-900">{sug.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{sug.action}</p>
              <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                <strong className="text-stone-700">Scientific rationale: </strong>
                {sug.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Personalized Health Considerations (Hypertension / Diabetes / Kidney / Allergies) */}
      {healthPreference?.conditions && healthPreference.conditions.length > 0 && (
        <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-800">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
                Personalized Health Considerations
              </h2>
              <span className="text-[11px] text-stone-500">
                Evidence-based dietary parameters aligned with your profile
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(dailyInsight?.conditionSpecificNotes || []).map((cond, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-950">{cond.condition}</span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider">
                    Educational Notice
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{cond.note}</p>
                <p className="text-[11px] text-stone-500 italic pt-1 border-t border-emerald-100">
                  {cond.educationalNotice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Data Confidence Transparency */}
      <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
          <ShieldAlert className="w-4 h-4 text-stone-500" />
          <span>Data Confidence & Measurement Transparency</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {dailyInsight?.dataConfidenceExplanation ||
            'Nutrient values are calculated from structured laboratory food composition tables. Home recipes, restaurant cooking oil, and portion variability can influence precise amounts.'}
        </p>
      </div>

      {/* 6. AI Conversational Summary (Gemini 3.8 Flash) */}
      <div className="p-6 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-['Outfit',sans-serif]">
                Supportive AI Nutrition Summary
              </h2>
              <span className="text-[11px] text-stone-500">
                Powered by server-side Gemma (gemma-4-31b-it) for clear, conversational insights
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerateAiExplanation}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI Summary'}</span>
          </button>
        </div>

        {aiExplanation ? (
          <div className="p-4 bg-white/90 rounded-xl border border-emerald-200 text-xs text-stone-700 leading-relaxed whitespace-pre-line">
            {aiExplanation}
          </div>
        ) : (
          <p className="text-xs text-stone-600 italic">
            Click "Generate AI Summary" above to receive an encouraging, personalized review of
            today's logged meals in plain everyday language.
          </p>
        )}
      </div>
    </div>
  );
};
