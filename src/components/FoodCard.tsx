import React from 'react';
import { FoodItem } from '../types';
import { Beef, Droplet } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function FoodCard({ food, onSelect, isSelected = false }: FoodCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-2xl bg-white border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'border-[#F4CDA5] active:scale-[0.98]'
          : 'active:scale-[0.98]'
      }`}
      style={{
        borderColor: isSelected ? '#F4CDA5' : 'rgba(59, 46, 37, 0.25)',
        boxShadow: isSelected ? '0 6px 16px rgba(244, 205, 165, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {food.type === 'dry' ? (
              <Beef className="w-4 h-4 text-[#F4CDA5]" />
            ) : (
              <Droplet className="w-4 h-4 text-[#D1A27B]" />
            )}
            <span className="text-xs text-[#6E5C50] uppercase tracking-wide">
              {food.type}
            </span>
          </div>
          <h3 className="text-[#3B2E25] mb-1">{food.name}</h3>
          {food.brand && <p className="text-[#6E5C50]">{food.brand}</p>}
        </div>
        <div className="text-right">
          <div className="text-[#3B2E25]">{food.caloriesPerHundredGrams}</div>
          <div className="text-[#6E5C50]">kcal/100g</div>
        </div>
      </div>
      {food.protein !== undefined && (
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(59, 46, 37, 0.1)' }}>
          <div className="text-xs">
            <span className="text-[#6E5C50]">Protein: </span>
            <span className="text-[#3B2E25]">{food.protein}%</span>
          </div>
          <div className="text-xs">
            <span className="text-[#6E5C50]">Fat: </span>
            <span className="text-[#3B2E25]">{food.fat}%</span>
          </div>
        </div>
      )}
    </button>
  );
}
