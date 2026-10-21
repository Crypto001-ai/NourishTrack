/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { INITIAL_FOOD_DATABASE } from '../../data/foodDatabase';
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  ArrowRight,
  Search,
  Heart,
  Activity,
  Layers,
  Utensils,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setIsAuthModalOpen, login, setActivePage } = useNutrition();
  const [explorerQuery, setExplorerQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredFoods = INITIAL_FOOD_DATABASE.filter((f) => {
    const matchQ =
      explorerQuery === '' ||
      f.name.toLowerCase().includes(explorerQuery.toLowerCase()) ||
      (f.localName && f.localName.toLowerCase().includes(explorerQuery.toLowerCase())) ||
      f.tags.some((t) => t.toLowerCase().includes(explorerQuery.toLowerCase()));

    const matchF =
      selectedFilter === 'all' ||
      (selectedFilter === 'nigerian' && f.tags.includes('nigerian')) ||
      (selectedFilter === 'legumes' && f.category === 'legumes') ||
      (selectedFilter === 'soups' && f.category === 'soups_stews') ||
      (selectedFilter === 'vegetables' && f.category === 'vegetables');

    return matchQ && matchF;
  }).slice(0, 8);

  const handleDemoLaunch = async () => {
    try {
      await login('adeniranabdullahi358@gmail.com');
      setActivePage('dashboard');
    } catch (err) {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Purpose */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-900">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>Eat. Track. Understand. Improve.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 font-['Outfit',sans-serif] text-balance leading-[1.12]">
              Turn daily meal records into{' '}
              <span className="text-emerald-700 underline decoration-emerald-200 decoration-4 underline-offset-6">
                understandable
              </span>{' '}
              nutrition insights.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              NourishTrack helps you understand what you eat every day without restrictive calorie
              judgments. Powered by verified food composition datasets — including authentic
              Nigerian staples and USDA references.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleDemoLaunch}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all flex items-center gap-2 group"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3.5 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors shadow-2xs"
              >
                Create Free Account
              </button>
            </div>

            {/* Scientific Trust Kicker */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Zero Fabricated Nutrients
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Nigerian Food Composition Table
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Non-Diagnostic Educational Model
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 bg-white rounded-3xl shadow-xl border border-stone-200/90 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Today's Recorded Balance
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-800 font-semibold tabular-nums">
                  1,845 / 2,050 kcal
                </span>
              </div>

              {/* Sample Logged Meal Preview: Authentic Nigerian Lunch */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span className="text-emerald-800 font-bold uppercase tracking-wider">
                    Lunch · 13:15
                  </span>
                  <span className="font-mono text-stone-600">828 kcal</span>
                </div>
                <p className="text-xs font-medium text-stone-800">
                  Jollof Rice (1.5 cups) + Spiced Grilled Chicken (1 piece) + Steamed Efo Riro (1 ladle) + Boiled Plantain
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono tabular-nums text-stone-500">
                  <span>48g Protein</span>
                  <span>·</span>
                  <span>10.5g Fibre</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold">High Veg Variety</span>
                </div>
              </div>

              {/* Macro Bar breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-mono text-[11px] text-stone-600">
                  <span>Protein: 86g (115% target)</span>
                  <span>Fibre: 27g (96% target)</span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full flex overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[45%]" />
                  <div className="bg-amber-600 h-full w-[35%]" />
                  <div className="bg-stone-500 h-full w-[20%]" />
                </div>
              </div>

              {/* Daily Insight Snapshot */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Supportive Insight</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  "Great fiber and plant diversity today from the spinach in Efo Riro and honey
                  beans. Sodium stayed within healthy parameters."
                </p>
              </div>

              <button
                onClick={handleDemoLaunch}
                className="w-full py-2.5 text-xs font-semibold text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-center block"
              >
                Explore Live Demo Workspace →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Answers Section: The 7 Core Nutrition Questions */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Clarity Over Confusion
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-['Outfit',sans-serif]">
            Clear Answers to Your Daily Eating Questions
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Eating shouldn't feel like a guessing game or an audit. NourishTrack translates everyday
            meals into practical, transparent answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              q: 'What have I eaten today?',
              a: 'A clean, multi-food timeline organizing your breakfast, lunch, dinner, snacks, and hydration in one place.',
              icon: Utensils,
            },
            {
              q: 'Am I eating a balanced variety of foods?',
              a: 'Track food group diversity across whole grains, legumes, leafy greens, tubers, and lean proteins.',
              icon: Layers,
            },
            {
              q: 'Am I consuming enough protein and fibre?',
              a: 'Accurate gram counters calculated from verified composition tables, not arbitrary AI guesses.',
              icon: Activity,
            },
            {
              q: 'Am I frequently eating excess sodium or added sugar?',
              a: 'Nonjudgmental alerts highlighting high-sodium bouillon or heavily sweetened snacks, with flavorful herb alternatives.',
              icon: Heart,
            },
            {
              q: 'What simple changes could improve my diet?',
              a: 'Practical suggestions like choosing boiled plantain over double-fried dodo, or adding steamed efo riro.',
              icon: Sparkles,
            },
            {
              q: 'How can I plan meals around health conditions?',
              a: 'Evidence-based parameters for hypertension, diabetes, and allergies without ever claiming to diagnose or predict illness.',
              icon: ShieldCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3 hover:border-emerald-600 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                  {item.q}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.a}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Food Explorer Section */}
      <section id="foods-explorer" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Verified Database
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-['Outfit',sans-serif] mt-1">
                Explore Authentic Nigerian & USDA Food Data
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                Search verified nutrient profiles for local Nigerian dishes (Jollof, Amala, Egusi,
                Moi Moi, Akara) and global staples. Zero fabricated numbers.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food e.g. Jollof, Moi Moi..."
                value={explorerQuery}
                onChange={(e) => setExplorerQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Featured Foods' },
              { id: 'nigerian', label: 'Nigerian Staples' },
              { id: 'legumes', label: 'Beans & Moi Moi' },
              { id: 'soups', label: 'Soups & Stews' },
              { id: 'vegetables', label: 'Leafy Greens' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                      {food.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {food.servingGrams}g
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 mt-1">{food.name}</h4>
                  <p className="text-[11px] text-stone-500">{food.servingUnit}</p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 font-mono tabular-nums text-xs">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-extrabold text-stone-900">{food.calories} kcal</span>
                    <span className="text-[11px] text-emerald-800 font-semibold">
                      {food.protein}g protein
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>{food.fiber}g fibre</span>
                    <span>{food.sodium}mg sodium</span>
                  </div>
                  <div className="text-[9px] text-stone-400 truncate pt-1">
                    {food.dataSource}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section id="evidence-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 bg-stone-900 text-stone-200 rounded-3xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Evidence-Based Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit',sans-serif]">
              Built on Deterministic Science, Not Unsupported AI Guesses
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              When it comes to nutrition, precision matters. NourishTrack decouples computational
              calculations from language models to guarantee accurate, reproducible results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Verified Data Sources</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Calculations rely strictly on verified reference databases (USDA FoodData Central and
                Nigerian Food Composition Tables). Estimates are always marked transparently.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-sm text-white">Safe Health Personalization</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                For conditions like hypertension or diabetes, the app highlights established
                dietary risk factors (sodium, carb consistency). Complex conditions (like kidney
                disease) advise clinical consultation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Respectful AI Explanation</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Gemini 3.8 Flash is used exclusively to explain nutritional findings in warm,
                supportive, everyday language — never to fabricate nutrient values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-5">
        <h2 className="text-3xl font-bold text-stone-900 font-['Outfit',sans-serif]">
          Ready to understand your meals without judgment?
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Start recording today. Explore the full suite of daily journals, Recharts weekly
          analytics, and personalized What Should I Eat suggestions.
        </p>
        <button
          onClick={handleDemoLaunch}
          className="px-8 py-3.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
        >
          <span>Get Started with Demo Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
