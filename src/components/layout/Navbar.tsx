/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { Leaf, Plus, Sparkles, User as UserIcon, Menu, X, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    activePage,
    setActivePage,
    setIsAddMealOpen,
    setIsWhatToEatOpen,
    setIsAuthModalOpen,
    currentDate,
    goToToday,
  } = useNutrition();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const handleNavClick = (page: typeof activePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark (Single Text Element with subtle icon) */}
          <button
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2 text-stone-900 group whitespace-nowrap shrink-0 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="font-['Outfit',sans-serif] font-bold text-xl tracking-tight text-stone-900">
              Nourish<span className="text-emerald-700">Track</span>
            </span>
          </button>

          {/* Zone 2: Single-Line Concise Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 ${
                    activePage === 'dashboard'
                      ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 pb-0.5'
                      : ''
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('journal')}
                  className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 ${
                    activePage === 'journal'
                      ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 pb-0.5'
                      : ''
                  }`}
                >
                  Meal Journal
                </button>
                <button
                  onClick={() => handleNavClick('insights')}
                  className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 ${
                    activePage === 'insights'
                      ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 pb-0.5'
                      : ''
                  }`}
                >
                  Nutrition Insights
                </button>
                <button
                  onClick={() => handleNavClick('reports')}
                  className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 ${
                    activePage === 'reports'
                      ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 pb-0.5'
                      : ''
                  }`}
                >
                  Weekly Reports
                </button>
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 ${
                    activePage === 'profile'
                      ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 pb-0.5'
                      : ''
                  }`}
                >
                  Profile & Health
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('landing')}
                  className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    handleNavClick('landing');
                    setTimeout(() => {
                      document.getElementById('foods-explorer')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Food Database
                </button>
                <button
                  onClick={() => {
                    handleNavClick('landing');
                    setTimeout(() => {
                      document.getElementById('evidence-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Evidence & Science
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWhatToEatOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200/80 rounded-lg hover:bg-emerald-100/80 transition-colors whitespace-nowrap shrink-0"
                  title="What Should I Eat? Personalized suggestions"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>What to Eat?</span>
                </button>

                <button
                  onClick={() => setIsAddMealOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Meal</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  Sign In / Demo
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200 space-y-1">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('journal')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Meal Journal
                </button>
                <button
                  onClick={() => handleNavClick('insights')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Nutrition Insights
                </button>
                <button
                  onClick={() => handleNavClick('reports')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Weekly Reports
                </button>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Profile & Health Preferences
                </button>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setIsWhatToEatOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 text-center text-xs font-semibold text-emerald-900 bg-emerald-50 rounded-md"
                  >
                    What to Eat?
                  </button>
                  <button
                    onClick={() => {
                      setIsAddMealOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 text-center text-xs font-semibold text-white bg-emerald-700 rounded-md"
                  >
                    Log Meal
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('landing')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-stone-700 hover:bg-stone-100"
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md text-emerald-700 font-semibold"
                >
                  Sign In / Try Demo
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
