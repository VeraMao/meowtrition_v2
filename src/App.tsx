import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { Onboarding } from './screens/Onboarding';
import { ProfileSetup } from './screens/ProfileSetup';
import { FoodLibrary } from './screens/FoodLibrary';
import { FoodLibraryHub } from './screens/FoodLibraryHub';
import { FoodDetail } from './screens/FoodDetail';
import { FeedingPlan } from './screens/FeedingPlan';
import { MealMixOptimizer } from './screens/MealMixOptimizer';
import { Dashboard } from './screens/Dashboard';
import { FeedingLog } from './screens/FeedingLog';
import { Settings } from './screens/Settings';
import { ShareZone } from './screens/ShareZone';
import { ManageCats } from './screens/ManageCats';
import { ManageFoods } from './screens/ManageFoods';
import { ThemeSelector } from './screens/ThemeSelector';
import { CatProfile, FoodItem, FeedingPlan as FeedingPlanType, FeedingLog as FeedingLogType, Screen, AppSettings, ThemeName, FoodReview, CommunityPost } from './types';
import { mockFoods } from './data/mockFoods';
import { mockCommunityPosts } from './data/mockCommunityPosts';
import { ThemeProvider } from './components/ThemeProvider';
import { PlanUpdateNotification } from './components/PlanUpdateNotification';
import { calculateMER, calculateDailyFoodAmount, calculateCaloriesForGoal } from './utils/calculations';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [showAddCustomFood, setShowAddCustomFood] = useState(false);
  const [mealMixSelectedFoods, setMealMixSelectedFoods] = useState<string[]>([]);
  const [catProfiles, setCatProfiles] = useState<CatProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>(mockFoods);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogType[]>([]);
  const [userReviews, setUserReviews] = useState<FoodReview[]>([]);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>(mockCommunityPosts.filter(p => p.userId === 'current-user'));
  const [appSettings, setAppSettings] = useState<AppSettings>({
    unitPreferences: {
      weight: 'kg',
      portion: 'g',
      calorie: 'kcal/100g',
    },
  });
  const [planUpdateComparison, setPlanUpdateComparison] = useState<{
    catName: string;
    profileId: string;
    oldCalories: number;
    newCalories: number;
    oldGrams: number;
    newGrams: number;
    newProfile: CatProfile;
    targetScreen: Screen;
  } | null>(null);

  const catProfile = catProfiles.find(p => p.id === currentProfileId) || null;
  const editingProfile = catProfiles.find(p => p.id === editingProfileId) || null;
  const selectedFoodId = catProfile?.selectedFoodId || null;
  const feedingPlan = catProfile?.feedingPlan || null;

  useEffect(() => {
    const savedData = localStorage.getItem('catFeederData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.catProfiles) setCatProfiles(data.catProfiles);
        if (data.currentProfileId) setCurrentProfileId(data.currentProfileId);
        if (data.foods) setFoods(data.foods);
        if (data.appSettings) setAppSettings(data.appSettings);
        if (data.feedingLogs) {
          const parsedLogs = data.feedingLogs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
          setFeedingLogs(parsedLogs);
        }
        // Check if any cat has a feeding plan to go to dashboard
        const hasAnyPlan = data.catProfiles?.some((cat: CatProfile) => cat.feedingPlan);
        if (data.catProfiles?.length > 0 && hasAnyPlan) {
          setCurrentScreen('dashboard');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (catProfiles.length > 0 || feedingLogs.length > 0) {
      const dataToSave = {
        catProfiles,
        currentProfileId,
        foods,
        feedingLogs,
        appSettings,
      };
      localStorage.setItem('catFeederData', JSON.stringify(dataToSave));
    }
  }, [catProfiles, currentProfileId, foods, feedingLogs, appSettings]);

  const handleProfileComplete = (profile: CatProfile) => {
    const existingIndex = catProfiles.findIndex(p => p.id === profile.id);
    if (existingIndex >= 0) {
      // Editing existing profile
      const existing = catProfiles[existingIndex];
      
      // Check if key nutritional factors have changed and they have a feeding plan
      const hasNutritionalChanges = existing.feedingPlan && (
        existing.currentWeight !== profile.currentWeight ||
        existing.activityLevel !== profile.activityLevel ||
        existing.isNeutered !== profile.isNeutered ||
        existing.age !== profile.age
      );
      
      // Determine target screen
      const wasEditingCurrentProfile = editingProfileId === currentProfileId;
      let targetScreen: Screen = 'settings';
      if (wasEditingCurrentProfile && existing.feedingPlan) {
        targetScreen = 'settings';
      } else if (editingProfileId) {
        targetScreen = 'manage-cats';
      } else if (existing.feedingPlan) {
        targetScreen = 'dashboard';
      } else {
        targetScreen = 'food-library';
      }
      
      if (hasNutritionalChanges && existing.feedingPlan && existing.selectedFoodId) {
        // Calculate old and new nutrition needs
        // Use the goal-based calculation to properly handle weight loss/gain goals
        // Use the goal from the updated profile's feeding plan (if changed) or existing plan
        const updatedPlan = profile.feedingPlan || existing.feedingPlan;
        const weightGoal = updatedPlan.weightGoal || 'maintain';
        const customFactor = updatedPlan.customFactor;
        
        // Old calories: use existing plan's calories (already calculated correctly)
        const oldCalories = existing.feedingPlan.totalCaloriesPerDay;
        
        // New calories: calculate based on goal and updated profile
        // This will use target weight for loss/gain goals, current weight for maintain
        const newCalories = calculateCaloriesForGoal(profile, weightGoal, customFactor);
        
        const selectedFood = foods.find(f => f.id === existing.selectedFoodId);
        if (selectedFood) {
          const oldGrams = calculateDailyFoodAmount(
            oldCalories,
            selectedFood.caloriesPerHundredGrams
          );
          const newGrams = calculateDailyFoodAmount(newCalories, selectedFood.caloriesPerHundredGrams);
          
          // Show comparison modal
          setPlanUpdateComparison({
            catName: profile.name,
            profileId: profile.id,
            oldCalories,
            newCalories,
            oldGrams,
            newGrams,
            newProfile: {
              ...profile,
              selectedFoodId: existing.selectedFoodId,
              feedingPlan: updatedPlan, // Use updated plan with potentially new goal
            },
            targetScreen,
          });
          
          // Clear editing state
          setEditingProfileId(null);
          return;
        }
      }
      
      // No nutritional changes or no feeding plan - just update
      const updated = [...catProfiles];
      updated[existingIndex] = {
        ...profile,
        selectedFoodId: existing.selectedFoodId,
        feedingPlan: existing.feedingPlan,
      };
      setCatProfiles(updated);
      
      // Clear editing state
      setEditingProfileId(null);
      
      // Navigate to target screen
      setCurrentScreen(targetScreen);
    } else {
      // New profile
      setCatProfiles([...catProfiles, profile]);
      setCurrentProfileId(profile.id);
      setCurrentScreen('food-library');
    }
  };

  const handleUpdatePlan = () => {
    if (!planUpdateComparison) return;
    
    const { profileId, newProfile, newCalories, targetScreen } = planUpdateComparison;
    const selectedFood = foods.find(f => f.id === newProfile.selectedFoodId);
    
    if (selectedFood && newProfile.feedingPlan) {
      // Recalculate the feeding plan with new calories
      const newGrams = Math.round(calculateDailyFoodAmount(newCalories, selectedFood.caloriesPerHundredGrams));
      
      const updatedPlan: FeedingPlanType = {
        ...newProfile.feedingPlan,
        totalCaloriesPerDay: Math.round(newCalories),
        totalGramsPerDay: newGrams,
        amGrams: Math.round(newGrams / 2),
        pmGrams: Math.round(newGrams / 2),
      };
      
      // Update profile with new plan
      const updatedProfiles = catProfiles.map(p => 
        p.id === profileId ? { ...newProfile, feedingPlan: updatedPlan } : p
      );
      setCatProfiles(updatedProfiles);
    } else {
      // Just update the profile without plan changes
      const updatedProfiles = catProfiles.map(p => 
        p.id === profileId ? newProfile : p
      );
      setCatProfiles(updatedProfiles);
    }
    
    setPlanUpdateComparison(null);
    setCurrentScreen(targetScreen);
  };
  
  const handleKeepCurrentPlan = () => {
    if (!planUpdateComparison) return;
    
    const { profileId, newProfile, targetScreen } = planUpdateComparison;
    
    // Update profile but keep the existing plan
    const updatedProfiles = catProfiles.map(p => 
      p.id === profileId ? newProfile : p
    );
    setCatProfiles(updatedProfiles);
    
    setPlanUpdateComparison(null);
    setCurrentScreen(targetScreen);
  };

  const handleFoodSelect = (foodId: string) => {
    if (catProfile) {
      const updatedProfile = { ...catProfile, selectedFoodId: foodId };
      const updatedProfiles = catProfiles.map(p => 
        p.id === catProfile.id ? updatedProfile : p
      );
      setCatProfiles(updatedProfiles);
    }
    setCurrentScreen('feeding-plan');
  };

const handlePlanComplete = (plan: FeedingPlanType) => {
  if (catProfile) {
    const collectedIds = new Set<string>();
    if (plan.foodId) collectedIds.add(plan.foodId);
    plan.amPortions?.forEach((portion) => collectedIds.add(portion.foodId));
    plan.pmPortions?.forEach((portion) => collectedIds.add(portion.foodId));

    const existingIds =
      catProfile.selectedFoodIds ||
      (catProfile.selectedFoodId ? [catProfile.selectedFoodId] : []);
    existingIds.forEach((id) => collectedIds.add(id));

    const updatedProfile = {
      ...catProfile,
      feedingPlan: plan,
      selectedFoodId: plan.foodId || catProfile.selectedFoodId,
      selectedFoodIds: Array.from(collectedIds),
    };
    const updatedProfiles = catProfiles.map(p => 
      p.id === catProfile.id ? updatedProfile : p
    );
    setCatProfiles(updatedProfiles);
  }
    setCurrentScreen('dashboard');
  };

  const handleAddLog = (log: Omit<FeedingLogType, 'id'>) => {
    const newLog: FeedingLogType = {
      ...log,
      id: `log-${Date.now()}`,
      catId: currentProfileId || undefined,
    };
    setFeedingLogs([newLog, ...feedingLogs]);
  };

  const handleAddFood = (food: FoodItem) => {
    setFoods([...foods, food]);
    
    // Automatically add to current cat's library
    if (catProfile) {
      const updatedProfile = { ...catProfile };
      const currentLibrary = updatedProfile.userLibraryFoodIds || [];
      updatedProfile.userLibraryFoodIds = [...currentLibrary, food.id];
      
      const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
      setCatProfiles(updatedProfiles);
    }
    
    setShowAddCustomFood(false);
  };

  const handleCompleteOnboarding = () => {
    setCurrentScreen('profile-setup');
  };

  const handleSkipOnboarding = () => {
    setCurrentScreen('profile-setup');
  };

  const handleLogout = () => {
    localStorage.removeItem('catFeederData');
    setCatProfiles([]);
    setCurrentProfileId(null);
    setFeedingLogs([]);
    setFoods(mockFoods);
    setCurrentScreen('splash');
  };

  const handleSwitchProfile = (profileId: string) => {
    const newProfile = catProfiles.find(p => p.id === profileId);
    setCurrentProfileId(profileId);
    
    // If the cat doesn't have a feeding plan, redirect to food selection
    if (newProfile && !newProfile.feedingPlan) {
      setCurrentScreen('food-library');
    }
  };

  const handleDeleteCat = (profileId: string) => {
    const updatedProfiles = catProfiles.filter(p => p.id !== profileId);
    setCatProfiles(updatedProfiles);
    
    // If we deleted the current profile, switch to another one
    if (profileId === currentProfileId && updatedProfiles.length > 0) {
      setCurrentProfileId(updatedProfiles[0].id);
    }
  };

  const handleUpdateTheme = (theme: ThemeName) => {
    if (catProfile) {
      const updatedProfile = { ...catProfile, themePreference: theme };
      const updatedProfiles = catProfiles.map(p => 
        p.id === catProfile.id ? updatedProfile : p
      );
      setCatProfiles(updatedProfiles);
    }
  };

  const selectedFood = foods.find((f) => f.id === selectedFoodId);

  const handleNavigate = (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => {
    const screenMap: Record<typeof page, Screen> = {
      dashboard: 'dashboard',
      library: 'food-library',
      'feeding-log': 'feeding-log',
      profile: 'settings',
    };
    setCurrentScreen(screenMap[page]);
  };

  const handleFoodSelectFromLibrary = (foodId: string) => {
    setSelectedFoodForDetail(foodId);
    setCurrentScreen('food-detail');
  };

  const handleAddReview = (review: Omit<FoodReview, 'id' | 'timestamp'>) => {
    const newReview: FoodReview = {
      ...review,
      id: `review-${Date.now()}`,
      timestamp: new Date(),
    };
    setUserReviews([...userReviews, newReview]);
    
    // Add review to the food item
    setFoods(foods.map(food => {
      if (food.id === selectedFoodForDetail) {
        const reviews = [...(food.reviews || []), newReview];
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return {
          ...food,
          reviews,
          rating: avgRating,
          reviewCount: reviews.length,
        };
      }
      return food;
    }));
  };

  const handleDeleteReview = (reviewId: string) => {
    setUserReviews(userReviews.filter(r => r.id !== reviewId));
    // Also remove from food items
    setFoods(foods.map(food => ({
      ...food,
      reviews: food.reviews?.filter(r => r.id !== reviewId),
    })));
  };

  const handleDeletePost = (postId: string) => {
    setUserPosts(userPosts.filter(p => p.id !== postId));
  };

  // Ensure active theme is one of the valid themes (migrate old themes to warm-amber)
  const validThemes: ThemeName[] = ['warm-amber', 'soft-cream-neutral', 'frosted-taupe', 'nutmeg-sand'];
  const activeTheme = catProfile?.themePreference && validThemes.includes(catProfile.themePreference)
    ? catProfile.themePreference
    : 'warm-amber';

  return (
    <ThemeProvider theme={activeTheme}>
      <div className="fixed inset-0 bg-gray-100 overflow-y-auto">
        <div className="max-w-[390px] mx-auto bg-white min-h-screen shadow-xl relative">
          {currentScreen === 'splash' && (
            <SplashScreen onStart={() => setCurrentScreen('onboarding')} />
          )}

          {currentScreen === 'onboarding' && (
            <Onboarding onComplete={handleCompleteOnboarding} onSkip={handleSkipOnboarding} />
          )}

        {currentScreen === 'profile-setup' && (
        <ProfileSetup
          onComplete={handleProfileComplete}
          onBack={() => {
            const wasEditingCurrentProfile = editingProfileId === currentProfileId;
            setEditingProfileId(null);
            if (wasEditingCurrentProfile && catProfile?.feedingPlan) {
              // Editing current profile from Settings
              setCurrentScreen('settings');
            } else if (catProfile?.feedingPlan) {
              setCurrentScreen('dashboard');
            } else if (editingProfileId) {
              setCurrentScreen('manage-cats');
            } else {
              setCurrentScreen('splash');
            }
          }}
          existingProfile={editingProfile || undefined}
          unitPreferences={appSettings.unitPreferences}
        />
      )}

      {currentScreen === 'food-library' && !catProfile?.feedingPlan && (
        <FoodLibrary
          foods={foods}
          onSelect={handleFoodSelect}
          onBack={() => {
            if (previousScreen === 'meal-mix-optimizer') {
              setPreviousScreen(null);
              setCurrentScreen('meal-mix-optimizer');
            } else {
              setCurrentScreen('profile-setup');
            }
          }}
          onAddFood={handleAddFood}
          multiSelectMode={previousScreen === 'meal-mix-optimizer'}
          initialSelectedIds={previousScreen === 'meal-mix-optimizer' ? mealMixSelectedFoods : []}
          onMultiSelect={(foodIds) => {
            setMealMixSelectedFoods(foodIds);
            setPreviousScreen(null);
            setCurrentScreen('meal-mix-optimizer');
          }}
        />
      )}

      {currentScreen === 'food-library' && catProfile?.feedingPlan && previousScreen !== 'meal-mix-optimizer' && (
        <FoodLibraryHub
          foods={foods}
          onFoodSelect={handleFoodSelectFromLibrary}
          onNavigate={handleNavigate}
          onAddCustomFood={() => setShowAddCustomFood(true)}
          userLibraryFoodIds={catProfile?.userLibraryFoodIds}
          onAddToLibrary={(foodId) => {
            if (!catProfile) return;
            const updatedProfiles = catProfiles.map((p) => {
              if (p.id === catProfile.id) {
                const currentLibrary = p.userLibraryFoodIds || [];
                return {
                  ...p,
                  userLibraryFoodIds: currentLibrary.includes(foodId)
                    ? currentLibrary
                    : [...currentLibrary, foodId],
                };
              }
              return p;
            });
            setCatProfiles(updatedProfiles);
          }}
          feedingPlanFoodIds={(() => {
            const plan = catProfile?.feedingPlan;
            if (!plan) return [];
            const ids = new Set<string>();
            ids.add(plan.foodId);
            plan.amPortions?.forEach(p => ids.add(p.foodId));
            plan.pmPortions?.forEach(p => ids.add(p.foodId));
            return Array.from(ids);
          })()}
          selectedFoodIds={catProfile?.selectedFoodIds || (catProfile?.selectedFoodId ? [catProfile.selectedFoodId] : [])}
          onAddFood={(foodId, food) => {
            if (!catProfile || !catProfile.feedingPlan) return;

            // If wet food is added, navigate to MealMixOptimizer
            if (food && food.type === 'wet') {
              const existingSelections = catProfile.selectedFoodIds?.length
                ? catProfile.selectedFoodIds
                : catProfile.selectedFoodId
                  ? [catProfile.selectedFoodId]
                  : [];
              const nextSelections = Array.from(new Set([...existingSelections, foodId]));
              setMealMixSelectedFoods(nextSelections);
              setCurrentScreen('meal-mix-optimizer');
              return;
            }

            const updatedProfile = { ...catProfile };
            const currentFoods = updatedProfile.selectedFoodIds || (updatedProfile.selectedFoodId ? [updatedProfile.selectedFoodId] : []);

            // Add food if not already added
            if (!currentFoods.includes(foodId)) {
              updatedProfile.selectedFoodIds = [...currentFoods, foodId];

              // If no main food is set, set this as main
              if (!updatedProfile.selectedFoodId) {
                updatedProfile.selectedFoodId = foodId;
              }

              // Add to feeding plan portions with minimal allocation (0 grams initially)
              // User can adjust portions in Meal Mix Optimizer or it will be available in AddFeedingModal
              const plan = { ...updatedProfile.feedingPlan };

              // Check if food already exists in portions
              const existsInAm = plan.amPortions?.some(p => p.foodId === foodId);
              const existsInPm = plan.pmPortions?.some(p => p.foodId === foodId);
              const isMainFood = plan.foodId === foodId;

              if (!isMainFood && !existsInAm && !existsInPm) {
                // Add to both AM and PM portions with 0 grams (available for selection)
                plan.amPortions = [
                  ...(plan.amPortions || []),
                  { foodId, grams: 0, calories: 0 }
                ];
                plan.pmPortions = [
                  ...(plan.pmPortions || []),
                  { foodId, grams: 0, calories: 0 }
                ];
                plan.isMixed = true;
              }

              updatedProfile.feedingPlan = plan;

              const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
              setCatProfiles(updatedProfiles);
            }
          }}
          onRemoveFood={(foodId) => {
            if (!catProfile) return;
            const updatedProfile = { ...catProfile };
            
            // Remove from selectedFoodIds
            updatedProfile.selectedFoodIds = (updatedProfile.selectedFoodIds || []).filter(id => id !== foodId);
            
            // If it was the main food, clear it and set new main if available
            if (updatedProfile.selectedFoodId === foodId) {
              updatedProfile.selectedFoodId = updatedProfile.selectedFoodIds[0] || undefined;
            }
            
            // Remove from feeding plan portions
            if (updatedProfile.feedingPlan) {
              const plan = { ...updatedProfile.feedingPlan };
              plan.amPortions = plan.amPortions?.filter(p => p.foodId !== foodId);
              plan.pmPortions = plan.pmPortions?.filter(p => p.foodId !== foodId);
              
              // If no mixed portions remain, set isMixed to false
              if ((!plan.amPortions || plan.amPortions.length === 0) && 
                  (!plan.pmPortions || plan.pmPortions.length === 0)) {
                plan.isMixed = false;
              }
              
              updatedProfile.feedingPlan = plan;
            }
            
            const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
            setCatProfiles(updatedProfiles);
          }}
          onBack={previousScreen === 'manage-foods' ? () => {
            setPreviousScreen(null);
            setCurrentScreen('manage-foods');
          } : undefined}
          catName={catProfile?.name || 'My Cat'}
        />
      )}

      {currentScreen === 'food-library' && catProfile?.feedingPlan && previousScreen === 'meal-mix-optimizer' && (
        <FoodLibrary
          foods={foods}
          onSelect={handleFoodSelect}
          onBack={() => {
            setPreviousScreen(null);
            setCurrentScreen('meal-mix-optimizer');
          }}
          onAddFood={handleAddFood}
          multiSelectMode={true}
          initialSelectedIds={mealMixSelectedFoods}
          onMultiSelect={(foodIds) => {
            setMealMixSelectedFoods(foodIds);
            setPreviousScreen(null);
            setCurrentScreen('meal-mix-optimizer');
          }}
        />
      )}

      {currentScreen === 'feeding-plan' && catProfile && selectedFood && (
        <FeedingPlan
          catProfile={catProfile}
          selectedFood={selectedFood}
          onComplete={handlePlanComplete}
          onBack={() => setCurrentScreen('food-library')}
          onMixMeal={() => {
            // Initialize with current food selection
            if (catProfile?.selectedFoodId) {
              setMealMixSelectedFoods([catProfile.selectedFoodId]);
            }
            setCurrentScreen('meal-mix-optimizer');
          }}
        />
      )}

      {currentScreen === 'meal-mix-optimizer' && catProfile && (
        <MealMixOptimizer
          catProfile={catProfile}
          allFoods={foods}
          onComplete={handlePlanComplete}
          onBack={() => setCurrentScreen('feeding-plan')}
          onNavigateToFoodLibrary={() => {
            setPreviousScreen('meal-mix-optimizer');
            setCurrentScreen('food-library');
          }}
          initialSelectedFoodIds={mealMixSelectedFoods}
        />
      )}

      {currentScreen === 'dashboard' && catProfile && selectedFood && feedingPlan && (
        <Dashboard
          catProfile={catProfile}
          selectedFood={selectedFood}
          feedingPlan={feedingPlan}
          feedingLogs={feedingLogs.filter(log => log.catId === currentProfileId || !log.catId)}
          foods={foods}
          onAddLog={handleAddLog}
          onNavigateToLog={() => setCurrentScreen('feeding-log')}
          onNavigateToSettings={() => setCurrentScreen('settings')}
          onNavigateToLibrary={() => setCurrentScreen('food-library')}
          allProfiles={catProfiles}
          onSwitchProfile={handleSwitchProfile}
          defaultWeightUnit={appSettings.unitPreferences.weight}
        />
      )}

      {currentScreen === 'feeding-log' && feedingPlan && selectedFood && (
        <FeedingLog
          feedingLogs={feedingLogs.filter(log => log.catId === currentProfileId || !log.catId)}
          foods={foods}
          feedingPlan={feedingPlan}
          selectedFood={selectedFood}
          onAddLog={handleAddLog}
          onNavigate={handleNavigate}
          userLibraryFoodIds={catProfile?.userLibraryFoodIds}
          selectedFoodIds={catProfile?.selectedFoodIds}
        />
      )}

      {currentScreen === 'settings' && catProfile && selectedFood && (
        <Settings
          catProfile={catProfile}
          selectedFood={selectedFood}
          onNavigate={handleNavigate}
          onEditProfile={() => {
            setEditingProfileId(currentProfileId);
            setCurrentScreen('profile-setup');
          }}
          onEditFood={() => setCurrentScreen('food-library')}
          onManageCats={() => setCurrentScreen('manage-cats')}
          onManageFoods={() => setCurrentScreen('manage-foods')}
          onShareZone={() => setCurrentScreen('community')}
          onThemeSelector={() => setCurrentScreen('theme-selector')}
          onLogout={handleLogout}
          appSettings={appSettings}
          onUpdateSettings={setAppSettings}
          onUpdateTheme={handleUpdateTheme}
        />
      )}

      {currentScreen === 'manage-cats' && (
        <ManageCats
          profiles={catProfiles}
          currentProfileId={currentProfileId}
          onBack={() => setCurrentScreen('settings')}
          onAddCat={() => {
            setEditingProfileId(null);
            setCurrentScreen('profile-setup');
          }}
          onEditCat={(profile) => {
            setEditingProfileId(profile.id);
            setCurrentScreen('profile-setup');
          }}
          onDeleteCat={handleDeleteCat}
          onSwitchProfile={(profileId) => {
            handleSwitchProfile(profileId);
            setCurrentScreen('dashboard');
          }}
          defaultWeightUnit={appSettings.unitPreferences.weight}
        />
      )}

      {currentScreen === 'manage-foods' && catProfile && (
        <ManageFoods
          catName={catProfile.name}
          foods={foods}
          selectedFoodIds={catProfile.selectedFoodIds || (catProfile.selectedFoodId ? [catProfile.selectedFoodId] : [])}
          mainFoodId={catProfile.selectedFoodId || null}
          onBack={() => setCurrentScreen('settings')}
          onAddFood={() => {
            setPreviousScreen('manage-foods');
            setCurrentScreen('food-library');
          }}
          onRemoveFood={(foodId) => {
            const updatedProfile = { ...catProfile };
            // Remove from selectedFoodIds
            updatedProfile.selectedFoodIds = (updatedProfile.selectedFoodIds || []).filter(id => id !== foodId);
            // If it was the main food, clear it
            if (updatedProfile.selectedFoodId === foodId) {
              updatedProfile.selectedFoodId = updatedProfile.selectedFoodIds[0] || undefined;
            }
            const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
            setCatProfiles(updatedProfiles);
          }}
          onSetMainFood={(foodId) => {
            const updatedProfile = { ...catProfile, selectedFoodId: foodId };
            const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
            setCatProfiles(updatedProfiles);
          }}
        />
      )}

      {currentScreen === 'community' && (
        <ShareZone
          onBack={() => setCurrentScreen('settings')}
          currentCatName={catProfile?.name}
        />
      )}

      {currentScreen === 'theme-selector' && catProfile && (
        <ThemeSelector
          currentTheme={catProfile.themePreference || 'warm-amber'}
          onBack={() => setCurrentScreen('settings')}
          onUpdateTheme={handleUpdateTheme}
        />
      )}

      {currentScreen === 'food-detail' && selectedFoodForDetail && (
        <FoodDetail
          food={foods.find(f => f.id === selectedFoodForDetail)!}
          onBack={() => setCurrentScreen('food-library')}
          onAddToMyPlan={(foodId) => {
            const food = foods.find(f => f.id === foodId);

            // If cat already has a feeding plan
            if (catProfile?.feedingPlan && food) {
              // If it's wet food, navigate to meal mix optimizer
              if (food.type === 'wet') {
                const existingSelections = catProfile.selectedFoodIds?.length
                  ? catProfile.selectedFoodIds
                  : catProfile.selectedFoodId
                    ? [catProfile.selectedFoodId]
                    : [];
                const nextSelections = Array.from(new Set([...existingSelections, foodId]));
                setMealMixSelectedFoods(nextSelections);
                setCurrentScreen('meal-mix-optimizer');
              } else {
                // If it's dry food, just add it without navigating
                const updatedProfile = { ...catProfile };
                const currentFoods = updatedProfile.selectedFoodIds || (updatedProfile.selectedFoodId ? [updatedProfile.selectedFoodId] : []);

                if (!currentFoods.includes(foodId)) {
                  updatedProfile.selectedFoodIds = [...currentFoods, foodId];

                  if (!updatedProfile.selectedFoodId) {
                    updatedProfile.selectedFoodId = foodId;
                  }

                  const plan = { ...updatedProfile.feedingPlan };
                  const existsInAm = plan.amPortions?.some(p => p.foodId === foodId);
                  const existsInPm = plan.pmPortions?.some(p => p.foodId === foodId);
                  const isMainFood = plan.foodId === foodId;

                  if (!isMainFood && !existsInAm && !existsInPm) {
                    plan.amPortions = [
                      ...(plan.amPortions || []),
                      { foodId, grams: 0, calories: 0 }
                    ];
                    plan.pmPortions = [
                      ...(plan.pmPortions || []),
                      { foodId, grams: 0, calories: 0 }
                    ];
                    plan.isMixed = true;
                  }

                  updatedProfile.feedingPlan = plan;

                  const updatedProfiles = catProfiles.map(p => p.id === catProfile.id ? updatedProfile : p);
                  setCatProfiles(updatedProfiles);
                }
              }
            } else {
              // If no feeding plan yet, go to feeding-plan screen
              handleFoodSelect(foodId);
              setCurrentScreen('feeding-plan');
            }
          }}
          onShareReview={handleAddReview}
          onNavigate={handleNavigate}
          currentProfile={catProfile || undefined}
        />
      )}

      {planUpdateComparison && (
        <PlanUpdateNotification
          catName={planUpdateComparison.catName}
          comparison={{
            oldCalories: planUpdateComparison.oldCalories,
            newCalories: planUpdateComparison.newCalories,
            oldGrams: planUpdateComparison.oldGrams,
            newGrams: planUpdateComparison.newGrams,
          }}
          onUpdatePlan={handleUpdatePlan}
          onKeepCurrent={handleKeepCurrentPlan}
        />
      )}

      {/* Add Custom Food Overlay */}
      {showAddCustomFood && (
        <div className="absolute inset-0 z-50 bg-white">
          <FoodLibrary
            foods={foods}
            onSelect={(foodId) => {
              // This won't be used in add mode
              console.log('Selected:', foodId);
            }}
            onBack={() => setShowAddCustomFood(false)}
            onAddFood={handleAddFood}
            startWithAddForm={true}
          />
        </div>
      )}
        </div>
      </div>
    </ThemeProvider>
  );
}
