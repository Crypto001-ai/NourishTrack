/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { FoodItem, MealCategory, MealRecord, MealRecordItem } from '../../types/nutrition';
import { INITIAL_FOOD_DATABASE } from '../../data/foodDatabase';
import { api } from '../../services/api';
import {
  X,
  Plus,
  Trash2,
  Search,
  Check,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealToEdit?: MealRecord | null;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  initialMealToEdit,
}) => {
  const { addMeal, editMeal, currentDate, healthPreference } = useNutrition();

  const [category, setCategory] = useState<MealCategory>('lunch');
  const [mealDate, setMealDate] = useState<string>(currentDate);
  const [mealTime, setMealTime] = useState<string>('13:00');
  const [notes, setNotes] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<MealRecordItem[]>([]);

  // Search & food browser state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState<boolean>(false);
  const [allFoods, setAllFoods] = useState<FoodItem[]>(INITIAL_FOOD_DATABASE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom food form state
  const [customName, setCustomName] = useState<string>('');
  const [customServingUnit, setCustomServingUnit] = useState<string>('1 portion (150g)');
  const [customCalories, setCustomCalories] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(5);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(6);
  const [customFiber, setCustomFiber] = useState<number>(3);
  const [customSodium, setCustomSodium] = useState<number>(250);

  // Initialize or reset form
  useEffect(() => {
    if (initialMealToEdit) {
      setCategory(initialMealToEdit.category);
      setMealDate(initialMealToEdit.date);
      setMealTime(initialMealToEdit.time || '12:00');
      setNotes(initialMealToEdit.notes || '');
      setSelectedItems([...initialMealToEdit.items]);
    } else {
      setCategory('lunch');
      setMealDate(currentDate);
      const now = new Date();
      setMealTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
      setNotes('');
      setSelectedItems([]);
    }
  }, [initialMealToEdit, currentDate, isOpen]);

  // Load foods from API if available
  useEffect(() => {
    api.getFoods().then((res) => {
      if (res.foods && res.foods.length > 0) {
        setAllFoods(res.foods);
      }
    }).catch(() => {
      setAllFoods(INITIAL_FOOD_DATABASE);
    });
  }, []);

  if (!isOpen) return null;

  // Filter foods for picker
  const filteredFoods = allFoods.filter((f) => {
    const matchesSearch =
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.localName && f.localName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      selectedCategoryFilter === 'all' ||
      f.category === selectedCategoryFilter ||
      (selectedCategoryFilter === 'nigerian' && f.tags.includes('nigerian')) ||
      (selectedCategoryFilter === 'legumes' && f.category === 'legumes') ||
      (selectedCategoryFilter === 'soups' && f.category === 'soups_stews') ||
      (selectedCategoryFilter === 'vegetables' && f.category === 'vegetables');

    return matchesSearch && matchesCat;
  });

  // Calculate live totals for the meal
  const mealTotals = selectedItems.reduce(
    (acc, it) => {
      acc.calories += it.calculatedCalories;
      acc.protein += it.calculatedProtein;
      acc.carbs += it.calculatedCarbs;
      acc.fat += it.calculatedFat;
      acc.fiber += it.calculatedFiber;
      acc.sodium += it.calculatedSodium;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );

  // Add food to meal basket
  const handleAddFoodItem = (food: FoodItem) => {
    const defaultQty = 1;
    const newItem: MealRecordItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      foodName: food.localName ? `${food.name} (${food.localName})` : food.name,
      portionUnit: food.servingUnit,
      quantity: defaultQty,
      servingMultiplier: defaultQty,
      preparationMethod: 'standard',
      calculatedCalories: Math.round(food.calories * defaultQty),
      calculatedProtein: Math.round(food.protein * defaultQty * 10) / 10,
      calculatedCarbs: Math.round(food.carbs * defaultQty * 10) / 10,
      calculatedFat: Math.round(food.fat * defaultQty * 10) / 10,
      calculatedFiber: Math.round(food.fiber * defaultQty * 10) / 10,
      calculatedSodium: Math.round(food.sodium * defaultQty),
      calculatedAddedSugar: Math.round(food.addedSugar * defaultQty * 10) / 10,
      dataSource: food.dataSource,
      dataQuality: food.dataQuality,
      foodGroup: food.foodGroup,
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    const qty = Math.max(0.1, Number(newQty) || 1);
    const updated = [...selectedItems];
    const item = updated[index];
    const baseFood = allFoods.find((f) => f.id === item.foodId);

    const baseCal = baseFood ? baseFood.calories : item.calculatedCalories / (item.quantity || 1);
    const baseProt = baseFood ? baseFood.protein : item.calculatedProtein / (item.quantity || 1);
    const baseCarb = baseFood ? baseFood.carbs : item.calculatedCarbs / (item.quantity || 1);
    const baseFat = baseFood ? baseFood.fat : item.calculatedFat / (item.quantity || 1);
    const baseFib = baseFood ? baseFood.fiber : item.calculatedFiber / (item.quantity || 1);
    const baseSod = baseFood ? baseFood.sodium : item.calculatedSodium / (item.quantity || 1);

    item.quantity = qty;
    item.servingMultiplier = qty;
    item.calculatedCalories = Math.round(baseCal * qty);
    item.calculatedProtein = Math.round(baseProt * qty * 10) / 10;
    item.calculatedCarbs = Math.round(baseCarb * qty * 10) / 10;
    item.calculatedFat = Math.round(baseFat * qty * 10) / 10;
    item.calculatedFiber = Math.round(baseFib * qty * 10) / 10;
    item.calculatedSodium = Math.round(baseSod * qty);

    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      const res = await api.createCustomFood({
        name: customName.trim(),
        servingUnit: customServingUnit,
        calories: customCalories,
        protein: customProtein,
        carbs: customCarbs,
        fat: customFat,
        fiber: customFiber,
        sodium: customSodium,
        category: 'grains_tubers',
        foodGroup: 'whole_grains',
      });

      setAllFoods([res.food, ...allFoods]);
      handleAddFoodItem(res.food);
      setIsCustomFoodOpen(false);
      setCustomName('');
    } catch (err) {
      console.error('Failed to create custom food:', err);
    }
  };

  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one food to this meal entry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const mealData = {
        category,
        date: mealDate,
        time: mealTime,
        items: selectedItems,
        notes,
      };

      if (initialMealToEdit) {
        await editMeal(initialMealToEdit.id, mealData);
      } else {
        await addMeal(mealData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving meal:', err);
      alert('Unable to save meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check user allergies against selected food items
  const userAllergies = new Set(healthPreference?.allergies || []);
  const detectedAllergenWarnings = selectedItems.flatMap((item) => {
    const food = allFoods.find((f) => f.id === item.foodId);
    if (!food) return [];
    return food.allergens
      .filter((a) => userAllergies.has(a as any))
      .map((a) => ({ foodName: food.name, allergen: a }));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/60">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-['Outfit',sans-serif]">
              {initialMealToEdit ? 'Edit Meal Record' : 'Log a Meal'}
            </h2>
            <p className="text-xs text-stone-500">
              Record multiple foods consumed in this sitting with verified nutrient data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2 columns on desktop */}
        <form onSubmit={handleSubmitMeal} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Allergen Warning Banner if applicable */}
          {detectedAllergenWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">Recorded Allergy Notice</p>
                <p className="mt-0.5">
                  You selected food(s) that traditionally contain ingredients on your allergy list:
                </p>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {detectedAllergenWarnings.map((w, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{w.foodName}</span> contains{' '}
                      <span className="capitalize font-semibold">{w.allergen}</span> (e.g. crayfish in soups, peanuts in suya spice)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Top Row: Category, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Meal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MealCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="breakfast">Breakfast</option>
                <option value="brunch">Brunch</option>
                <option value="lunch">Lunch</option>
                <option value="midday_snack">Midday Snack</option>
                <option value="dinner">Dinner</option>
                <option value="evening_snack">Evening Snack</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Time Consumed
              </label>
              <input
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Main Grid: Selected Foods in this meal & Search Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: Foods Selected In This Meal */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Foods In This Meal ({selectedItems.length})
                </h3>
                <span className="text-xs font-mono text-emerald-800 font-semibold tabular-nums">
                  {mealTotals.calories} kcal total
                </span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <p className="text-xs text-stone-500">
                    No foods added yet. Search or click any food from the right catalog to add it
                    to this meal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-50/80 border border-stone-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">
                            {item.foodName}
                          </p>
                          <p className="text-xs text-stone-500">{item.portionUnit}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity & Serving multiplier */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-500 font-medium">Qty:</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0.1"
                            max="20"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(index, parseFloat(e.target.value))
                            }
                            className="w-16 px-2 py-1 text-xs border border-stone-300 rounded bg-white text-center font-mono font-medium"
                          />
                        </div>
                        <div className="text-stone-600 font-mono tabular-nums text-right">
                          <span className="font-semibold text-stone-900">
                            {item.calculatedCalories} kcal
                          </span>{' '}
                          · {item.calculatedProtein}g P · {item.calculatedFiber}g F
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Meal Nutrition Summary Card */}
              {selectedItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
                  <p className="font-semibold text-emerald-950">Meal Total Breakdown</p>
                  <div className="grid grid-cols-3 gap-2 font-mono tabular-nums text-emerald-900">
                    <div>
                      <span className="block text-[10px] uppercase text-emerald-700">Protein</span>
                      <span className="font-bold text-sm">{Math.round(mealTotals.protein * 10) / 10}g</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-emerald-700">Carbs</span>
                      <span className="font-bold text-sm">{Math.round(mealTotals.carbs * 10) / 10}g</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-emerald-700">Fat</span>
                      <span className="font-bold text-sm">{Math.round(mealTotals.fat * 10) / 10}g</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-stone-600 font-mono text-[11px] tabular-nums">
                    <span>Fibre: {Math.round(mealTotals.fiber * 10) / 10}g</span>
                    <span>Sodium: {Math.round(mealTotals.sodium)}mg</span>
                  </div>
                </div>
              )}

              {/* Meal Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prepared at home, lighter oil, half portion dodo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Right 7 cols: Searchable Food Database Picker */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Search Food Database
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCustomFoodOpen(!isCustomFoodOpen)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline"
                >
                  {isCustomFoodOpen ? 'Close Custom Entry' : '+ Custom Food'}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Nigerian foods (Jollof, Amala, Efo, Akara, Suya) or global staples..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Category Segmented Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Foods' },
                  { id: 'nigerian', label: 'Nigerian Staples' },
                  { id: 'soups', label: 'Soups & Stews' },
                  { id: 'legumes', label: 'Beans & Moi Moi' },
                  { id: 'proteins', label: 'Proteins & Fish' },
                  { id: 'vegetables', label: 'Greens & Veggies' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap shrink-0 transition-colors ${
                      selectedCategoryFilter === tab.id
                        ? 'bg-emerald-700 text-white font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Custom Food Creation Drawer if opened */}
              {isCustomFoodOpen && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-950">Add Custom Food Item</span>
                    <span className="text-[11px] text-stone-500">Marked as user-estimated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-600 block">Food Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Homemade Ofe Nsala"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full p-1.5 border border-stone-200 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-600 block">Serving Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 bowl (200g)"
                        value={customServingUnit}
                        onChange={(e) => setCustomServingUnit(e.target.value)}
                        className="w-full p-1.5 border border-stone-200 rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div>
                      <label className="text-[10px] text-stone-500">Calories</label>
                      <input
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(Number(e.target.value))}
                        className="w-full p-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500">Protein (g)</label>
                      <input
                        type="number"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(Number(e.target.value))}
                        className="w-full p-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500">Carbs (g)</label>
                      <input
                        type="number"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(Number(e.target.value))}
                        className="w-full p-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500">Fat (g)</label>
                      <input
                        type="number"
                        value={customFat}
                        onChange={(e) => setCustomFat(Number(e.target.value))}
                        className="w-full p-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500">Fiber (g)</label>
                      <input
                        type="number"
                        value={customFiber}
                        onChange={(e) => setCustomFiber(Number(e.target.value))}
                        className="w-full p-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCustomFood}
                    className="w-full py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded hover:bg-emerald-800"
                  >
                    Save & Add to Meal
                  </button>
                </div>
              )}

              {/* Filtered Food Catalog List */}
              <div className="h-[320px] overflow-y-auto space-y-1.5 border border-stone-200 rounded-xl p-2 bg-stone-50/40">
                {filteredFoods.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500">
                    No foods found matching "{searchQuery}". You can add it as a custom food above!
                  </div>
                ) : (
                  filteredFoods.map((food) => {
                    const hasAllergyMatch = food.allergens.some((a) =>
                      userAllergies.has(a as any)
                    );
                    return (
                      <div
                        key={food.id}
                        className="p-2.5 bg-white border border-stone-200/80 rounded-lg hover:border-emerald-600 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-stone-900 truncate">
                              {food.name}
                            </span>
                            {food.localName && (
                              <span className="text-[11px] text-stone-500 font-medium">
                                · {food.localName}
                              </span>
                            )}
                            {hasAllergyMatch && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Allergy flag
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-0.5 font-mono tabular-nums">
                            <span>{food.servingUnit}</span>
                            <span>·</span>
                            <span className="text-emerald-800 font-medium">
                              {food.calories} kcal
                            </span>
                            <span>·</span>
                            <span>{food.protein}g P</span>
                            <span>·</span>
                            <span>{food.fiber}g Fib</span>
                          </div>
                          <div className="text-[10px] text-stone-400 truncate pt-0.5">
                            Source: {food.dataSource}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddFoodItem(food)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : initialMealToEdit
                  ? 'Update Meal Entry'
                  : `Save Meal (${selectedItems.length} items)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
