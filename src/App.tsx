/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NutritionProvider, useNutrition } from './context/NutritionContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { MealJournalView } from './components/journal/MealJournalView';
import { NutritionInsightsView } from './components/insights/NutritionInsightsView';
import { WeeklyReportView } from './components/reports/WeeklyReportView';
import { ProfileView } from './components/profile/ProfileView';
import { AddMealModal } from './components/journal/AddMealModal';
import { WhatShouldIEatModal } from './components/suggestions/WhatShouldIEatModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

const MainContent: React.FC = () => {
  const {
    activePage,
    isAddMealOpen,
    setIsAddMealOpen,
    isWhatToEatOpen,
    setIsWhatToEatOpen,
    user,
  } = useNutrition();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-stone-800">
      <Navbar />

      <main className="flex-1">
        {activePage === 'landing' && <LandingPage />}
        {activePage === 'dashboard' && (user ? <DashboardView /> : <LandingPage />)}
        {activePage === 'journal' && (user ? <MealJournalView /> : <LandingPage />)}
        {activePage === 'insights' && (user ? <NutritionInsightsView /> : <LandingPage />)}
        {activePage === 'reports' && (user ? <WeeklyReportView /> : <LandingPage />)}
        {activePage === 'profile' && (user ? <ProfileView /> : <LandingPage />)}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      <AddMealModal isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} />
      <WhatShouldIEatModal
        isOpen={isWhatToEatOpen}
        onClose={() => setIsWhatToEatOpen(false)}
      />
      <AuthModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <NutritionProvider>
      <MainContent />
    </NutritionProvider>
  );
}
