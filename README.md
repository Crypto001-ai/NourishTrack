# NourishTrack 🥗

> **Eat. Track. Understand. Improve.**

NourishTrack is an intelligent, modern, responsive nutrition and wellness web application designed to turn daily meal records into clear, actionable, evidence-based nutritional insights without restrictive calorie judgments or fabricated numbers.

---

## 🤖 Models Used

- **Model**: `gemma-4-31b-it`
- **Family**: **Gemma** (Google's open-weights model family)
- **Role in NourishTrack**:
  - Serves as the conversational intelligence layer on the server-side (`/api/ai/nutrition-explanation`).
  - Synthesizes complex daily macronutrient, micronutrient, and dietary variety data into warm, supportive, non-judgmental explanations.
  - Tailors practical food suggestions around recorded health considerations (such as hypertension or diabetes) and dietary preferences.
- **Architectural Boundary**: All numerical nutrient calculations (calories, protein, carbohydrates, total fat, dietary fibre, sodium, added sugar) are computed **deterministically** from structured food composition tables — **never** guessed or hallucinated by language models.

---

## 🛠️ Technologies Used

### Frontend
- **React 19** (`react`, `react-dom`): Latest component architecture with functional components and hooks.
- **TypeScript**: Strict type definitions for foods, meals, nutrient metrics, user profiles, and health preferences.
- **Vite 8**: High-performance module bundler and development server.
- **Tailwind CSS v4** (`@tailwindcss/vite`): Clean utility styling following domain-native visual design and typography discipline.
- **Recharts**: Responsive data visualizations for 7-day caloric trends, protein/fibre consistency, and food group frequency.
- **Lucide React**: Clean, accessible vector icons.
- **Motion**: Fluid UI transitions for modal dialogs and feedback banners.
- **Typography**: Google Fonts (*Plus Jakarta Sans* for body & navigation, *Outfit* for headings, and tabular numerals for alignment).

### Backend & API
- **Node.js** & **Express**: Full-stack backend providing RESTful endpoints for authentication, profile management, searchable food databases, meal CRUD, and analytics.
- **TypeScript Execution (`tsx`)**: Seamless TypeScript execution in Node.js.
- **@google/genai TypeScript SDK**: Modern Google GenAI SDK used strictly server-side to interface with `gemma-4-31b-it`. API keys and credentials never touch the client.
- **JSON File-Based Persistence**: Reliable atomic data persistence (`data/nourishtrack-store.json`) with sample seed data for instant evaluation.

### Nutrition Science & Food Composition Data
- **USDA FoodData Central**: Verified reference macronutrient and micronutrient profiles for global whole foods and staples.
- **Nigerian Food Composition Table (NFCT 2017 / FAO West African Table)**: Authentic, laboratory-referenced nutritional data for traditional West African dishes (Jollof Rice, Ofada Rice, Amala, Eba/Garri, Egusi Soup, Efo Riro, Moi Moi, Akara, Ewa Aganyin, Plantain, Catfish Pepper Soup, Suya, and more).
- **Mifflin-St Jeor & DRI Equations**: Deterministic BMR and Total Daily Energy Expenditure (TDEE) reference calculations adapted to age, sex, activity level, and personal goals.

---

## 🌟 Key Application Features

1. **Multi-Food Daily Meal Journal**:
   - Log multiple foods under a single meal sitting (Breakfast, Brunch, Lunch, Midday Snack, Dinner, Evening Snack, Other).
   - Adjustable portion sizes and real-time quantity multipliers.
   - Searchable food database with fast category filters and custom food creation.

2. **Personalized Health Considerations**:
   - Evidence-based parameters for diagnosed conditions (Hypertension, Diabetes, High Cholesterol, GERD).
   - Strict allergen cross-checks (alerts if a food traditionally contains user-recorded allergens like peanuts in Suya spice or crayfish in soups).
   - Non-diagnostic clinical safety boundary: strictly educational guidance that respects medical boundaries.

3. **Daily Nutrition Insights**:
   - Four-pillar daily review: *What Went Well*, *What Could Improve*, *Suggested Practical Adjustments*, and *Data Confidence Transparency*.
   - On-demand conversational synthesis powered by `gemma-4-31b-it`.

4. **"What Should I Eat?" Suggestions**:
   - Recommends balanced meal combinations based on remaining daily nutrient targets, strictly filtering out user allergens.

5. **Weekly Retrospective & Variety Tracker**:
   - 7-day intake charts and plant/vegetable food group variety tracking.
   - Fair Reporting: Missing logged days are never penalized or treated as skipped meals.

6. **Privacy & Data Ownership**:
   - 1-click complete JSON data export.
   - 1-click permanent account and meal record deletion.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` (optional for local AI features):
   ```env
   GEMINI_API_KEY="your_api_key_here"
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
