/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Leaf, Shield, Database, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-700 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="font-['Outfit',sans-serif] font-bold text-lg text-white">
                Nourish<span className="text-emerald-400">Track</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              Eat. Track. Understand. Improve. Transforming everyday meal entries into practical,
              evidence-based nutritional clarity without judgment or fabricated numbers.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> USDA FoodData Central
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Nigerian Food Composition Table (NFCT)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Nutrition Science
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>Mifflin-St Jeor Reference Targets</li>
              <li>WHO & DASH Sodium Guidelines</li>
              <li>Dietary Fiber Satiety Science</li>
              <li>Culturally Authentic Food Models</li>
            </ul>
          </div>

          {/* Privacy & Safe Personalization */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Ethics & Privacy
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>No Commercial Data Selling</li>
              <li>Full JSON Data Export</li>
              <li>Permanent 1-Click Data Deletion</li>
              <li>Non-diagnostic Safe Personalization</li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer Callout */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-400 text-xs leading-relaxed">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-200 font-medium">Educational & Lifestyle Disclaimer: </strong>
              NourishTrack provides educational nutrition insights and food composition estimations. It does not
              provide medical diagnoses, calculate medical disease risk probabilities, prescribe therapeutic diets,
              or substitute for personalized care by a physician or registered dietitian.
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} NourishTrack. All rights reserved.</p>
            <p>Built with deterministic food chemistry & verified West African and USDA composition tables.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
