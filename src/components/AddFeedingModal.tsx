import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { FoodItem, FeedingPlan } from '../types';

interface AddFeedingModalProps {
  onClose: () => void;
  onAddLog: (
    foodId: string,
    grams: number,
    calories: number,
    timestamp?: Date,
    customFoodName?: string
  ) => void;
  feedingPlan: FeedingPlan;
  foods: FoodItem[];
  onNavigateToFoodLibrary?: () => void;
  selectedFoodIds?: string[];
}

function TimePicker({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [selectedHour, setSelectedHour] = useState(value.getHours());
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newDate = new Date(value);
    newDate.setHours(selectedHour, selectedMinute, 0, 0);
    onChange(newDate);
  }, [selectedHour, selectedMinute]);

  useEffect(() => {
    if (value.getHours() !== selectedHour) setSelectedHour(value.getHours());
    if (value.getMinutes() !== selectedMinute) setSelectedMinute(value.getMinutes());
  }, [value]);

  const scrollToSelection = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (!ref.current) return;
    const itemHeight = 48;
    const paddingTop = 80;
    ref.current.scrollTop =
      index * itemHeight +
      paddingTop -
      (ref.current.clientHeight / 2 - itemHeight / 2);
  };

  useEffect(() => {
    scrollToSelection(hourRef, selectedHour);
  }, [selectedHour]);

  useEffect(() => {
    scrollToSelection(minuteRef, selectedMinute);
  }, [selectedMinute]);

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex-1 relative">
          <div className="text-center text-xs text-muted-foreground mb-2">Hour</div>
          <div className="relative h-48 overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 bg-primary/10 rounded-lg pointer-events-none z-10" />
            <div
              ref={hourRef}
              className="relative h-full overflow-y-auto scroll-smooth snap-y snap-mandatory hide-scrollbar z-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="h-20" />
              {hours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`w-full h-12 flex items-center justify-center snap-center transition-all ${
                    selectedHour === hour
                      ? 'text-foreground font-semibold text-xl'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
              ))}
              <div className="h-20" />
            </div>
          </div>
        </div>

        <div className="text-2xl text-foreground font-bold pt-8">:</div>

        <div className="flex-1 relative">
          <div className="text-center text-xs text-muted-foreground mb-2">Minute</div>
          <div className="relative h-48 overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 bg-primary/10 rounded-lg pointer-events-none z-10" />
            <div
              ref={minuteRef}
              className="relative h-full overflow-y-auto scroll-smooth snap-y snap-mandatory hide-scrollbar z-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="h-20" />
              {minutes.map((minute) => (
                <button
                  key={minute}
                  onClick={() => setSelectedMinute(minute)}
                  className={`w-full h-12 flex items-center justify-center snap-center transition-all ${
                    selectedMinute === minute
                      ? 'text-foreground font-semibold text-xl'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
              <div className="h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddFeedingModal({
  onClose,
  onAddLog,
  feedingPlan,
  foods,
  onNavigateToFoodLibrary,
  selectedFoodIds = [],
}: AddFeedingModalProps) {
  const availableFoodIds = new Set<string>();
  availableFoodIds.add(feedingPlan.foodId);
  if (feedingPlan.amPortions) feedingPlan.amPortions.forEach((p) => availableFoodIds.add(p.foodId));
  if (feedingPlan.pmPortions) feedingPlan.pmPortions.forEach((p) => availableFoodIds.add(p.foodId));
  selectedFoodIds.forEach((id) => availableFoodIds.add(id));

  const availableFoods = foods.filter((f) => availableFoodIds.has(f.id));
  const defaultFood = availableFoods[0] || foods[0];

  const [selectedFood, setSelectedFood] = useState<FoodItem | undefined>(defaultFood);
  const [amount, setAmount] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [todayDate, setTodayDate] = useState(new Date());

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setTodayDate(new Date());
    }, ms);
    return () => clearTimeout(timer);
  }, [todayDate]);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(todayDate);

  const handleIncrement = () => {
    const current = parseFloat(amount);
    setAmount(isNaN(current) ? '5' : (current + 5).toString());
  };

  const handleDecrement = () => {
    const current = parseFloat(amount);
    const safe = isNaN(current) ? 0 : current;
    setAmount(Math.max(0, safe - 5).toString());
  };

  const handleSubmit = () => {
    if (!selectedFood) return;
    const grams = parseFloat(amount);
    if (isNaN(grams) || grams <= 0) return;
    const calories = (grams / 100) * selectedFood.caloriesPerHundredGrams;
    const feedingDate = new Date(todayDate);
    feedingDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    onAddLog(selectedFood.id, grams, calories, feedingDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-[390px] w-full bg-card rounded-3xl animate-slide-up min-h-[70vh] max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-foreground">Add Feeding</h2>
          <button onClick={onClose} className="text-muted-foreground active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-0 space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-muted-foreground">Amount (grams)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-4 pr-16 bg-background border-2 border-primary rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col -space-y-1">
                <button onClick={handleIncrement} className="text-muted-foreground active:scale-95" type="button">
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button onClick={handleDecrement} className="text-muted-foreground active:scale-95" type="button">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-2xl active:bg-muted/80 transition-all text-left"
              type="button"
            >
              <span className="text-muted-foreground">Food</span>
              <span className="text-foreground">
                {selectedFood ? selectedFood.name : 'Select food'}
              </span>
            </button>

            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-lg z-10 max-h-72 overflow-y-auto"
              >
                {availableFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setShowDropdown(false);
                    }}
                    className={`w-full p-4 text-left transition-all ${
                      selectedFood?.id === food.id
                        ? 'bg-muted text-foreground'
                        : 'bg-white text-foreground hover:bg-muted'
                    }`}
                    type="button"
                  >
                    <div className="flex flex-col">
                      <span>{food.name}</span>
                      {food.brand && (
                        <span className="text-sm text-muted-foreground">{food.brand}</span>
                      )}
                    </div>
                  </button>
                ))}

                <div className="border-t border-border" />

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigateToFoodLibrary?.();
                  }}
                  className="w-full p-4 text-left transition-all bg-white text-foreground hover:bg-muted"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>Select more from food library</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground">
              Time <span className="text-sm text-muted-foreground">({formattedDate})</span>
            </label>
            <div className="bg-muted rounded-2xl overflow-hidden">
              <TimePicker value={selectedTime} onChange={setSelectedTime} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFood || !amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))}
            className={`w-full py-4 rounded-2xl transition-all ${
              selectedFood && amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount))
                ? 'bg-primary text-foreground active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            Add Feeding
          </button>
        </div>
      </div>
    </div>
  );
}