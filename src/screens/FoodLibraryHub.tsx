import React, { useState, useMemo } from 'react';
import { Search, Star, TrendingUp, Filter, Plus, X } from 'lucide-react';
import { FoodItem } from '../types';
import { BottomNav } from '../components/BottomNav';

interface FoodLibraryHubProps {
  foods: FoodItem[];
  onFoodSelect: (foodId: string) => void;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => void;
  onAddCustomFood: () => void;
  userLibraryFoodIds?: string[];
  onAddToLibrary?: (foodId: string) => void;
  feedingPlanFoodIds?: string[];
  selectedFoodIds?: string[]; // Foods already added to cat's food list
  onAddFood?: (foodId: string, food?: FoodItem) => void; // Add food directly without going to detail
  onRemoveFood?: (foodId: string) => void; // Remove food directly from cat's food list
  onBack?: () => void; // Optional back button (when navigating from manage-foods)
  catName?: string;
}

export function FoodLibraryHub({
  foods,
  onFoodSelect,
  onNavigate,
  onAddCustomFood,
  userLibraryFoodIds = [],
  onAddToLibrary,
  feedingPlanFoodIds = [],
  selectedFoodIds = [],
  onAddFood,
  onRemoveFood,
  onBack,
  catName,
}: FoodLibraryHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'dry' | 'wet' | 'treat' | 'prescription' | 'custom'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique tags from foods
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    foods.forEach((food) => {
      food.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [foods]);

  // Filter foods based on search, category, and tags
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Category filter
      if (activeCategory !== 'all' && food.type !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(query);
        const matchesBrand = food.brand?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some((tag) => food.tags?.includes(tag));
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });
  }, [foods, searchQuery, activeCategory, selectedTags]);

  // Get top-rated foods for highlights
  const topRatedFoods = useMemo(() => {
    return [...foods]
      .filter((f) => f.rating && f.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [foods]);

  // Get user's library foods
  const userLibraryFoods = useMemo(() => {
    return foods.filter((food) => userLibraryFoodIds.includes(food.id));
  }, [foods, userLibraryFoodIds]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'fill-secondary text-secondary' : 'text-border'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-primary/30 to-transparent pt-6 pb-8 px-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 w-10 h-10 rounded-xl bg-card flex items-center justify-center active:scale-95 transition-transform border border-border"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}
          >
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-foreground mb-2">Food Library</h1>
        <p className="text-muted-foreground">
          Find the best food for your cat — curated, rated, and reviewed by the Meowtrition community.
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 -mt-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or brand..."
            className="w-full pl-10 pr-4 py-3 bg-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground border border-border"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {(['all', 'dry', 'wet', 'treat', 'prescription', 'custom'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary text-foreground'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {category === 'all' ? 'All Foods' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Filters</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-primary flex items-center gap-1 active:scale-95"
            >
              <Filter className="w-4 h-4" />
              {selectedTags.length > 0 && `(${selectedTags.length})`}
            </button>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-foreground'
                      : 'bg-card text-muted-foreground border border-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Your Choices Section */}
      {userLibraryFoods.length > 0 && !searchQuery && activeCategory === 'all' && (
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📚</span>
            <h3 className="text-foreground">Your Choices</h3>
          </div>
          <div className="space-y-2">
            {userLibraryFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => onFoodSelect(food.id)}
                className="w-full bg-card rounded-xl p-3 border border-border active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      🍽️
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground truncate">{food.name}</h4>
                    {food.brand && (
                      <p className="text-muted-foreground truncate">{food.brand}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">{food.caloriesPerHundredGrams} kcal/100g</div>
                    {food.tags && food.tags[0] && (
                      <div className="text-primary text-sm">{food.tags[0]}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Community Highlights */}
      {topRatedFoods.length > 0 && !searchQuery && activeCategory === 'all' && (
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="text-foreground">Top Rated by Community</h3>
          </div>
          <div className="space-y-2">
            {topRatedFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => onFoodSelect(food.id)}
                className="w-full bg-card rounded-xl p-3 border border-border active:scale-[0.98] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      🍽️
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground truncate">{food.name}</h4>
                    {food.brand && (
                      <p className="text-muted-foreground truncate">{food.brand}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderStars(food.rating || 0)}
                    <span className="text-muted-foreground">
                      {food.reviewCount || 0} reviews
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food List */}
      <div className="px-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground">
            {searchQuery || selectedTags.length > 0
              ? `${filteredFoods.length} Results`
              : 'All Foods'}
          </h3>
          <button
            onClick={onAddCustomFood}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-foreground rounded-xl active:scale-95 transition-all"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Custom</span>
          </button>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No foods found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
                setActiveCategory('all');
              }}
              className="px-6 py-3 bg-primary text-foreground rounded-xl active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const isAdded = selectedFoodIds.includes(food.id);
            
            return (
              <div
                key={food.id}
                className="w-full bg-card rounded-2xl p-4 border border-border"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => onFoodSelect(food.id)}
                    className="flex-shrink-0 active:scale-95 transition-transform"
                  >
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => onFoodSelect(food.id)}
                    className="flex-1 min-w-0 text-left active:opacity-70 transition-opacity"
                  >
                    <h4 className="text-foreground mb-1">{food.name}</h4>
                    {food.brand && (
                      <p className="text-muted-foreground mb-2">{food.brand}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(food.rating || 0)}
                      <span className="text-muted-foreground">
                        ({food.reviewCount || 0})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">
                        {food.caloriesPerHundredGrams} kcal/100g
                      </span>
                      {food.tags && food.tags.length > 0 && (
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-xs whitespace-nowrap">
                          {food.tags[0]}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Add/Remove Button */}
                  {onAddFood && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdded && onRemoveFood) {
                          onRemoveFood(food.id);
                        } else if (!isAdded) {
                          onAddFood(food.id, food);
                        }
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl transition-all ${
                        isAdded
                          ? 'bg-red-100 text-red-700 active:scale-95 hover:bg-red-200'
                          : 'bg-primary text-foreground active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1">
                          <X className="w-4 h-4" />
                          Remove
                        </span>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav currentPage="library" onNavigate={onNavigate} />
    </div>
  );
}
