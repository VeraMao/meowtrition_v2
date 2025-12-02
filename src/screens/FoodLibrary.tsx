import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Scan, Star, Info, HelpCircle } from 'lucide-react';
import { FoodItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { InputField } from '../components/InputField';
import { BarcodeScanner } from '../components/BarcodeScanner';

interface FoodLibraryProps {
  foods: FoodItem[];
  onSelect: (foodId: string) => void;
  onBack?: () => void;
  onAddFood: (food: FoodItem) => void;
  startWithAddForm?: boolean; // Start directly in add form mode
  multiSelectMode?: boolean; // Enable multi-select mode
  initialSelectedIds?: string[]; // Initially selected food IDs for multi-select
  onMultiSelect?: (foodIds: string[]) => void; // Callback for multi-select
}

export function FoodLibrary({ foods, onSelect, onBack, onAddFood, startWithAddForm = false, multiSelectMode = false, initialSelectedIds = [], onMultiSelect }: FoodLibraryProps) {
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(initialSelectedIds);
  const [showAddForm, setShowAddForm] = useState(startWithAddForm);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'dry' | 'wet' | 'treat' | 'prescription' | 'custom'>('dry');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'calories'>('name');
  const [showCalorieHelper, setShowCalorieHelper] = useState(false);
  
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodBrand, setNewFoodBrand] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [newFoodType, setNewFoodType] = useState<'dry' | 'wet' | 'treat' | 'prescription' | 'custom'>('dry');
  const [calorieUnit, setCalorieUnit] = useState<'kcal/100g' | 'kcal/cup' | 'kcal ME/kg'>('kcal/100g');
  const [calorieValue, setCalorieValue] = useState('');

  // Convert input calories to kcal/100g for storage
  const convertToKcalPer100g = (value: number, unit: string): number => {
    switch (unit) {
      case 'kcal/100g':
        return value;
      case 'kcal/cup':
        // Approximate: 1 cup dry food ≈ 100g, 1 cup wet food ≈ 240g
        const gramsPerCup = newFoodType === 'wet' ? 240 : 100;
        return (value / gramsPerCup) * 100;
      case 'kcal ME/kg':
        return value / 10;
      default:
        return value;
    }
  };

  const filteredFoods = useMemo(() => {
    let filtered = foods.filter(f => f.type === activeTab);
    
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'calories':
        filtered.sort((a, b) => a.caloriesPerHundredGrams - b.caloriesPerHundredGrams);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return filtered;
  }, [foods, activeTab, sortBy]);

  const handleSelectFood = (foodId: string) => {
    if (multiSelectMode) {
      // Toggle selection in multi-select mode
      if (selectedFoodIds.includes(foodId)) {
        setSelectedFoodIds(selectedFoodIds.filter(id => id !== foodId));
      } else {
        setSelectedFoodIds([...selectedFoodIds, foodId]);
      }
    } else {
      setSelectedFoodId(foodId);
    }
  };

  const handleContinue = () => {
    if (multiSelectMode && onMultiSelect) {
      onMultiSelect(selectedFoodIds);
    } else if (selectedFoodId) {
      onSelect(selectedFoodId);
    }
  };

  const handleAddFood = () => {
    if (!newFoodName || !calorieValue) return;

    const caloriesPer100g = convertToKcalPer100g(parseFloat(calorieValue), calorieUnit);

    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      name: newFoodName,
      brand: newFoodBrand || undefined,
      caloriesPerHundredGrams: caloriesPer100g,
      type: newFoodType,
    };

    onAddFood(newFood);
    setShowAddForm(false);
    setNewFoodName('');
    setNewFoodBrand('');
    setCalorieValue('');
    setNewFoodCalories('');
    setNewFoodType('dry');
    setCalorieUnit('kcal/100g');
  };

  const handleBarcodeScan = (barcode: string) => {
    // Mock barcode lookup - in production, this would call an API
    const mockFoodData: { [key: string]: { name: string; brand: string; calories: number; type: 'dry' | 'wet' | 'treat' } } = {
      '123456789012': { name: 'Indoor Adult', brand: 'Royal Canin', calories: 375, type: 'dry' },
      '234567890123': { name: 'Wilderness Chicken', brand: 'Blue Buffalo', calories: 387, type: 'dry' },
      '345678901234': { name: 'Science Diet Adult', brand: 'Hills', calories: 350, type: 'dry' },
      '456789012345': { name: 'Core Pate', brand: 'Wellness', calories: 120, type: 'wet' },
    };

    const foodData = mockFoodData[barcode];
    
    if (foodData) {
      setNewFoodName(foodData.name);
      setNewFoodBrand(foodData.brand);
      setCalorieValue(foodData.calories.toString());
      setNewFoodType(foodData.type);
      setShowScanner(false);
      setShowAddForm(true);
    } else {
      // Food not found, let user enter manually
      alert(`Barcode ${barcode} not found in database. Please enter food details manually.`);
      setShowScanner(false);
      setShowAddForm(true);
    }
  };

  if (showScanner) {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white" style={{ borderBottom: '1px solid rgba(59, 46, 37, 0.1)' }}>
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => {
                if (startWithAddForm && onBack) {
                  onBack();
                } else {
                  setShowAddForm(false);
                }
              }}
              className="p-2 -ml-2 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-[#3B2E25]" />
            </button>
            <h2 className="text-[#3B2E25] flex-1">Add Custom Food</h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setShowScanner(true);
              }}
              className="p-2 bg-[#F4CDA5] rounded-xl active:scale-95"
            >
              <Scan className="w-5 h-5 text-[#3B2E25]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <InputField
            label="Food Name"
            value={newFoodName}
            onChange={setNewFoodName}
            placeholder="Premium Cat Food"
          />

          <InputField
            label="Brand (Optional)"
            value={newFoodBrand}
            onChange={setNewFoodBrand}
            placeholder="Brand Name"
          />

          <div className="space-y-2">
            <label className="text-[#6E5C50]">Food Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setNewFoodType('dry')}
                className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                  newFoodType === 'dry'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Dry
              </button>
              <button
                onClick={() => setNewFoodType('wet')}
                className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                  newFoodType === 'wet'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Wet
              </button>
              <button
                onClick={() => setNewFoodType('treat')}
                className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                  newFoodType === 'treat'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Treat
              </button>
              <button
                onClick={() => setNewFoodType('prescription')}
                className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                  newFoodType === 'prescription'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Prescription
              </button>
              <button
                onClick={() => setNewFoodType('custom')}
                className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                  newFoodType === 'custom'
                    ? 'bg-[#F4CDA5] text-[#3B2E25]'
                    : 'bg-[#E8D8C8] text-[#3B2E25]'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Calorie Input with Unit Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[#6E5C50]">Calorie Content</label>
              <button
                onClick={() => setShowCalorieHelper(true)}
                className="flex items-center gap-1 text-[#D1A27B] active:scale-95 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={calorieUnit}
                onChange={(e) => setCalorieUnit(e.target.value as any)}
                className="px-3 py-3 rounded-xl bg-[#E8D8C8] text-[#3B2E25] border-2 border-transparent focus:border-[#F4CDA5] outline-none text-sm"
              >
                <option value="kcal/100g">kcal/100g</option>
                <option value="kcal/cup">kcal/cup</option>
                <option value="kcal ME/kg">kcal ME/kg</option>
              </select>
              <input
                type="number"
                value={calorieValue}
                onChange={(e) => setCalorieValue(e.target.value)}
                placeholder="350"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#E8D8C8] focus:border-[#F4CDA5] outline-none bg-white"
              />
            </div>

            {calorieValue && calorieUnit !== 'kcal/100g' && (
              <div className="p-3 rounded-xl bg-[#F4E9DB]">
                <div className="text-[#6E5C50] text-sm">
                  Converted: ~{Math.round(convertToKcalPer100g(parseFloat(calorieValue), calorieUnit))} kcal/100g
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <ButtonPrimary
              onClick={handleAddFood}
              disabled={!newFoodName || !calorieValue}
            >
              Add Food
            </ButtonPrimary>
          </div>
        </div>

        {/* Calorie Helper Modal */}
        {showCalorieHelper && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#3B2E25]">Finding Calorie Info</h3>
                <button
                  onClick={() => setShowCalorieHelper(false)}
                  className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6E5C50]" />
                </button>
              </div>
              <div className="space-y-4 text-[#6E5C50]">
                <p>Look for the "Guaranteed Analysis" or "Nutritional Information" on your cat food packaging.</p>
                
                <div className="p-4 rounded-xl bg-[#F4E9DB]">
                  <div className="text-[#3B2E25] mb-1">kcal/100g</div>
                  <p className="text-sm">Most common on packaging. Look for "Metabolizable Energy" (ME).</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4E9DB]">
                  <div className="text-[#3B2E25] mb-1">kcal/cup</div>
                  <p className="text-sm">Common on dry food bags. The app will convert this for you.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4E9DB]">
                  <div className="text-[#3B2E25] mb-1">kcal ME/kg</div>
                  <p className="text-sm">Metabolizable Energy per kilogram. Common on commercial pet foods. Divide by 10 to get kcal/100g.</p>
                </div>

                <div className="p-3 rounded-xl bg-background border" style={{ borderColor: 'rgba(59, 46, 37, 0.1)' }}>
                  <p className="text-xs">
                    <strong>Can't find it?</strong> Check the manufacturer's website or contact their customer service. Calorie content is essential for accurate feeding.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalorieHelper(false)}
                className="w-full mt-6 py-3 rounded-xl bg-[#F4CDA5] text-[#3B2E25] active:scale-[0.98] transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid rgba(59, 46, 37, 0.1)' }}>
        <div className="flex items-center gap-4 p-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
              <ChevronLeft className="w-6 h-6 text-[#3B2E25]" />
            </button>
          )}
          <h2 className="text-[#3B2E25] flex-1">Food Library</h2>
          <button
            onClick={() => setShowScanner(true)}
            className="p-2 bg-[#E8D8C8] rounded-xl active:scale-95 mr-2"
          >
            <Scan className="w-5 h-5 text-[#3B2E25]" />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-[#F4CDA5] rounded-xl active:scale-95"
          >
            <Plus className="w-5 h-5 text-[#3B2E25]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dry')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'dry'
                ? 'bg-[#F4CDA5] text-[#3B2E25]'
                : 'bg-transparent text-[#6E5C50]'
            }`}
          >
            Dry
          </button>
          <button
            onClick={() => setActiveTab('wet')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'wet'
                ? 'bg-[#F4CDA5] text-[#3B2E25]'
                : 'bg-transparent text-[#6E5C50]'
            }`}
          >
            Wet
          </button>
          <button
            onClick={() => setActiveTab('treat')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'treat'
                ? 'bg-[#F4CDA5] text-[#3B2E25]'
                : 'bg-transparent text-[#6E5C50]'
            }`}
          >
            Treats
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'prescription'
                ? 'bg-[#F4CDA5] text-[#3B2E25]'
                : 'bg-transparent text-[#6E5C50]'
            }`}
          >
            Prescription
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-[#F4CDA5] text-[#3B2E25]'
                : 'bg-transparent text-[#6E5C50]'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Sort Options */}
        {activeTab !== 'treat' && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === 'name'
                    ? 'bg-[#D1A27B] text-white'
                    : 'bg-[#E8D8C8] text-[#6E5C50]'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                  sortBy === 'rating'
                    ? 'bg-[#D1A27B] text-white'
                    : 'bg-[#E8D8C8] text-[#6E5C50]'
                }`}
              >
                <Star className="w-3 h-3" />
                Rating
              </button>
              <button
                onClick={() => setSortBy('calories')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === 'calories'
                    ? 'bg-[#D1A27B] text-white'
                    : 'bg-[#E8D8C8] text-[#6E5C50]'
                }`}
              >
                Calories
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Food List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{activeTab === 'treat' ? '🐾' : '🍽️'}</div>
            <div className="text-[#6E5C50] mb-2">
              No {activeTab} {activeTab === 'treat' ? 'treats' : 'food'} added yet
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-[#D1A27B] underline"
            >
              Add your first {activeTab === 'treat' ? 'treat' : 'food'}
            </button>
          </div>
        )}
        
        {filteredFoods.map((food) => {
          const isSelected = multiSelectMode ? selectedFoodIds.includes(food.id) : selectedFoodId === food.id;
          
          return (
            <div
              key={food.id}
              onClick={() => handleSelectFood(food.id)}
              className={`relative rounded-2xl p-4 transition-all duration-300 cursor-pointer transform ${
                isSelected
                  ? 'ring-4 ring-[#F4CDA5] scale-[1.02] bg-gradient-to-br from-[#FFF5ED] to-white shadow-[0_8px_24px_rgba(244,205,165,0.5)]'
                  : 'bg-white hover:shadow-lg active:scale-[0.98] shadow-[0_2px_8px_rgba(59,46,37,0.05)]'
              }`}
            >
              {/* Selected Indicator Stripe */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F4CDA5] rounded-l-2xl animate-[slideIn_0.2s_ease-out]" />
              )}
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[#3B2E25]">
                    {food.name}
                  </div>
                </div>
                {food.brand && (
                  <div className="text-[#6E5C50] text-sm">{food.brand}</div>
                )}
              </div>
              {food.rating && (
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-4 h-4 fill-[#F4CDA5] text-[#F4CDA5]" />
                  <span className="text-[#3B2E25] text-sm">{food.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#6E5C50] text-sm">
                {food.caloriesPerHundredGrams} kcal/100g
              </div>
              {food.reviewCount && (
                <div className="text-[#D1A27B] text-xs">
                  {food.reviewCount.toLocaleString()} reviews
                </div>
              )}
            </div>
            {food.recommendedFor && food.recommendedFor.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {food.recommendedFor.map((rec) => (
                  <span
                    key={rec}
                    className="px-2 py-1 rounded-lg bg-[#F4E9DB] text-[#6E5C50] text-xs"
                  >
                    {rec === 'weight-loss' ? '📉 Weight Loss' : rec === 'weight-gain' ? '📈 Weight Gain' : '✓ Maintenance'}
                  </span>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Sticky Bottom Button */}
      {((multiSelectMode && selectedFoodIds.length > 0) || (!multiSelectMode && selectedFoodId)) && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFF5ED] via-[#FFF5ED] to-transparent max-w-[390px] mx-auto animate-[slideUp_0.3s_ease-out]">
          <ButtonPrimary onClick={handleContinue}>
            {multiSelectMode 
              ? `Continue with ${selectedFoodIds.length} Selected` 
              : `Continue with Selected ${activeTab === 'treat' ? 'Treat' : 'Food'}`
            }
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}
