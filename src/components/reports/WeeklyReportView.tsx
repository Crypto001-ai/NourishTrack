/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNutrition } from '../../context/NutritionContext';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Award,
  CheckCircle2,
  Info,
  Layers,
  Leaf,
  Activity,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const WeeklyReportView: React.FC = () => {
  const { weeklyReport, profile, healthPreference } = useNutrition();

  if (!weeklyReport) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading weekly nutrition report...
      </div>
    );
  }

  const {
    daysWithMeals,
    totalMealsLogged,
    dailyAverages,
    dailyTrend,
    foodGroupFrequency,
    repeatedPatterns,
    goalProgressSummary,
    keyRecommendations,
    startDate,
    endDate,
  } = weeklyReport;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>7-Day Retrospective</span>
            <span>·</span>
            <span>
              {startDate} to {endDate}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif] mt-0.5">
            Weekly Nutrition Report
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Days Logged & Incomplete Record Notice */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1: Days Active */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Recorded Days
          </span>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-3xl font-extrabold text-stone-900">{daysWithMeals}</span>
            <span className="text-xs text-stone-400">/ 7 days</span>
          </div>
          <p className="text-[11px] text-stone-500">
            {totalMealsLogged} total meals recorded across the week
          </p>
        </div>

        {/* Stat 2: Daily Avg Calories */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Average Calories
          </span>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-3xl font-extrabold text-stone-900">{dailyAverages.calories}</span>
            <span className="text-xs text-stone-400">kcal/day</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Target: {profile?.targetCalories || 2000} kcal/day
          </p>
        </div>

        {/* Stat 3: Daily Avg Protein */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Average Protein
          </span>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-3xl font-extrabold text-emerald-800">
              {dailyAverages.protein}
            </span>
            <span className="text-xs text-stone-400">g/day</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Target: {profile?.targetProteinG || 75}g/day
          </p>
        </div>

        {/* Stat 4: Daily Avg Fibre */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Average Dietary Fibre
          </span>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-3xl font-extrabold text-teal-800">{dailyAverages.fiber}</span>
            <span className="text-xs text-stone-400">g/day</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Target: {profile?.targetFiberG || 28}g/day
          </p>
        </div>
      </div>

      {/* Missing Entries Notice (Explicit requirement) */}
      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-stone-800">Fair Reporting Principle: </strong>
          Days with no recorded meals are not interpreted as skipped meals or zero-calorie days.
          Averages reflect only days when you actively logged meals to provide honest, meaningful
          comparisons.
        </p>
      </div>

      {/* Recharts Analytics: 7-Day Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Caloric Intake Trend */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                Daily Energy Intake (kcal)
              </h3>
              <p className="text-xs text-stone-500">Recorded calories vs your reference target</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              {profile?.targetCalories || 2000} kcal target
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="dayName" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} kcal`, 'Calories']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calories" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Protein & Fibre Consistency */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                Protein & Fibre Trajectory (g)
              </h3>
              <p className="text-xs text-stone-500">Tracking muscle repair and digestive health</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Protein
              </span>
              <span className="flex items-center gap-1 text-teal-700">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Fibre
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="dayName" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="#047857"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fiber"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Plant Food & Dietary Variety Breakdown */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
            Food Group Variety & Consistency
          </h3>
          <p className="text-xs text-stone-500">
            Number of recorded days where each essential food group was represented
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {foodGroupFrequency.map((fg, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">{fg.label}</span>
                <span className="font-mono tabular-nums text-stone-500">
                  {fg.count} / {daysWithMeals} days
                </span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-700 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (fg.count / Math.max(1, daysWithMeals)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Qualitative Insights: Repeated Patterns & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repeated Patterns */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
              Observed Eating Patterns
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed pl-5 list-disc">
            {repeatedPatterns.map((pat, idx) => (
              <li key={idx}>{pat}</li>
            ))}
          </ul>
        </div>

        {/* 2-3 Practical Recommendations */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
              Practical Weekly Recommendations
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed pl-5 list-disc">
            {keyRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
