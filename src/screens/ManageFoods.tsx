import React from 'react';
import { ChevronLeft, Plus, Star, Trash2 } from 'lucide-react';
import { FoodItem } from '../types';

interface ManageFoodsProps {
  catName: string;
  foods: FoodItem[];
  selectedFoodIds: string[]; // Array of food IDs that are in use
  mainFoodId: string | null; // The main feeding food
  onBack: () => void;
  onAddFood: () => void;
  onRemoveFood: (foodId: string) => void;
  onSetMainFood: (foodId: string) => void;
}

export function ManageFoods({
  catName,
  foods,
  selectedFoodIds,
  mainFoodId,
  onBack,
  onAddFood,
  onRemoveFood,
  onSetMainFood,
}: ManageFoodsProps) {
  const selectedFoods = foods.filter(f => selectedFoodIds.includes(f.id));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground">{catName}'s Foods</h1>
            <p className="text-muted-foreground">
              Manage foods and select main feeding food
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Food Button */}
        <button
          onClick={onAddFood}
          className="w-full bg-primary text-foreground py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Food from Library
        </button>

        {/* Foods List */}
        {selectedFoods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-foreground mb-2">No Foods Added</h3>
            <p className="text-muted-foreground mb-6">
              Add foods from the library to create a feeding plan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-muted-foreground px-2">Added Foods ({selectedFoods.length})</h2>
            {selectedFoods.map((food) => {
              const isMainFood = food.id === mainFoodId;
              
              return (
                <div
                  key={food.id}
                  className="bg-card rounded-2xl p-4 border border-border"
                  style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Food Icon */}
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">
                        {food.type === 'dry' ? '🥘' : food.type === 'wet' ? '🥫' : '🍖'}
                      </span>
                    </div>

                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-foreground">{food.name}</h3>
                        {isMainFood && (
                          <div className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs">Main</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {food.brand} • {food.type}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {food.caloriesPerHundredGrams} kcal/100g
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!isMainFood && (
                          <button
                            onClick={() => onSetMainFood(food.id)}
                            className="flex-1 py-2 px-3 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                          >
                            <Star className="w-4 h-4" />
                            Set as Main
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveFood(food.id)}
                          className="py-2 px-3 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        {selectedFoods.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h4 className="text-blue-900 mb-1">About Main Food</h4>
                <p className="text-blue-700 text-sm">
                  The main food is used for calculating daily portions and meal plans. 
                  You can add multiple foods and switch between them anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
