import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Cat, Scale, Activity, Bell, LogOut, Users, Settings as SettingsIcon, Palette, X, MessageSquare, Edit2 } from 'lucide-react';
import { CatProfile, FoodItem, AppSettings, WeightUnit, PortionUnit, ThemeName } from '../types';
import { BottomNav } from '../components/BottomNav';
import { themes, getAvailableThemes } from '../utils/themes';
import { convertWeight } from '../utils/calculations';

interface SettingsProps {
  catProfile: CatProfile;
  selectedFood: FoodItem;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => void;
  onEditProfile: () => void;
  onEditFood: () => void;
  onManageCats: () => void;
  onManageFoods: () => void;
  onShareZone: () => void;
  onThemeSelector: () => void;
  onLogout?: () => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTheme?: (theme: ThemeName) => void;
}

export function Settings({
  catProfile,
  selectedFood,
  onNavigate,
  onEditProfile,
  onEditFood,
  onManageCats,
  onManageFoods,
  onShareZone,
  onThemeSelector,
  onLogout,
  appSettings,
  onUpdateSettings,
  onUpdateTheme,
}: SettingsProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUnitSettings, setShowUnitSettings] = useState(false);
  
  // Get current theme for display
  const validThemes: ThemeName[] = ['warm-amber', 'soft-cream-neutral', 'frosted-taupe', 'nutmeg-sand'];
  const currentTheme = catProfile.themePreference && validThemes.includes(catProfile.themePreference)
    ? catProfile.themePreference
    : 'warm-amber';

  const handleWeightUnitChange = (unit: WeightUnit) => {
    onUpdateSettings({
      ...appSettings,
      unitPreferences: {
        ...appSettings.unitPreferences,
        weight: unit,
      },
    });
  };

  const handlePortionUnitChange = (unit: PortionUnit) => {
    onUpdateSettings({
      ...appSettings,
      unitPreferences: {
        ...appSettings.unitPreferences,
        portion: unit,
      },
    });
  };

  // Helper function to format weight based on unit preference
  const formatWeight = (weightInKg: number | undefined): string => {
    if (!weightInKg) return 'Not set';
    const unit = appSettings.unitPreferences.weight;
    const displayWeight = convertWeight(weightInKg, 'kg', unit);
    return `${displayWeight.toFixed(2)}${unit}`;
  };

  // Get theme colors
  const themeColors = themes[currentTheme];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-8 space-y-6">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 relative">
          <button
            onClick={onEditProfile}
            className="absolute top-4 right-4 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center active:scale-95 transition-all"
          >
            <Edit2 className="w-5 h-5 text-[#3B2E25]" />
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {catProfile.photoUrl ? (
                <img src={catProfile.photoUrl} alt={catProfile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl">🐱</div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-[#3B2E25]">{catProfile.name}</h3>
              <p className="text-[#6E5C50]">
                {catProfile.age} years • {formatWeight(catProfile.currentWeight)}
              </p>
              {catProfile.targetWeight && (
                <p className="text-[#6E5C50] mt-1">
                  Target: {formatWeight(catProfile.targetWeight)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1 bg-white/30 text-[#3B2E25] rounded-full text-sm">
              {catProfile.gender === 'male' ? '♂ Male' : '♀ Female'}
            </div>
            <div className="px-3 py-1 bg-white/30 text-[#3B2E25] rounded-full text-sm">
              {catProfile.isNeutered ? '✓ Neutered' : 'Not Neutered'}
            </div>
            <div className="px-3 py-1 bg-white/30 text-[#3B2E25] rounded-full text-sm capitalize">
              {catProfile.activityLevel} Activity
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-muted-foreground px-2">Cat Information</h3>
          <div className="bg-card rounded-2xl overflow-hidden border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
            <button
              onClick={onManageCats}
              className={`w-full flex items-center justify-between p-4 active:bg-muted ${catProfile.feedingPlan ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="text-foreground">Manage Cats</div>
                  <div className="text-muted-foreground">
                    Add, edit, or remove cats
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            {catProfile.feedingPlan && (
              <>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🍽️</span>
                      </div>
                      <div className="text-left">
                        <div className="text-foreground">{catProfile.name}'s Current Plan</div>
                        <div className="text-muted-foreground">
                          {selectedFood.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onManageFoods}
                      className="text-primary active:scale-95"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div className="flex-1 bg-muted rounded-xl p-3">
                      <div className="text-muted-foreground">Daily Amount</div>
                      <div className="text-foreground">
                        {Math.round(catProfile.feedingPlan.totalGramsPerDay)}g
                      </div>
                    </div>
                    <div className="flex-1 bg-muted rounded-xl p-3">
                      <div className="text-muted-foreground">Daily Calories</div>
                      <div className="text-foreground">
                        {Math.round(catProfile.feedingPlan.totalCaloriesPerDay)} kcal
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-muted-foreground px-2">Community</h3>
          <div className="bg-card rounded-2xl overflow-hidden border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
            <button
              onClick={onShareZone}
              className="w-full flex items-center justify-between p-4 active:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="text-foreground">Share Zone</div>
                  <div className="text-muted-foreground">
                    See what other 🐱 parents say — and share your experience.
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="px-2" style={{ color: themeColors.textSecondary }}>Preferences</h3>
          <div className="rounded-2xl overflow-hidden border border-border" style={{
            backgroundColor: themeColors.background,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
          }}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: `${themeColors.primary}20`
                }}>
                  <Bell className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <div className="text-left">
                  <div className="font-normal" style={{ color: themeColors.text }}>Notifications</div>
                  <div className="font-normal" style={{ color: themeColors.textSecondary }}>Feeding reminders</div>
                </div>
              </div>
              <div className="w-12 h-7 rounded-full relative cursor-pointer" style={{
                backgroundColor: themeColors.primary
              }}>
                <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${themeColors.secondary}40` }} />

            <button
              onClick={() => setShowUnitSettings(true)}
              className="w-full flex items-center justify-between p-4 active:opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: `${themeColors.primary}20`
                }}>
                  <SettingsIcon className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <div className="text-left">
                  <div className="font-normal text-foreground">Units</div>
                  <div className="font-normal text-muted-foreground">
                    {appSettings.unitPreferences.weight}, {appSettings.unitPreferences.portion}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
            </button>

            <div style={{ borderTop: `1px solid ${themeColors.secondary}40` }} />

            <button
              onClick={onThemeSelector}
              className="w-full flex items-center justify-between p-4 active:opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  backgroundColor: `${themeColors.primary}20`
                }}>
                  <Palette className="w-5 h-5" style={{ color: themeColors.secondary }} />
                </div>
                <div className="text-left">
                  <div className="font-normal" style={{ color: themeColors.text }}>App Theme</div>
                  <div className="font-normal" style={{ color: themeColors.textSecondary }}>
                    {themes[currentTheme]?.name || 'Warm Amber'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{
          backgroundColor: `${themeColors.primary}15`
        }}>
          <h4 className="mb-2" style={{ color: themeColors.text }}>About Meowtrition</h4>
          <p style={{ color: themeColors.textSecondary }}>
            Smart feeding planner using NRC nutritional standards. Calculate optimal
            portions based on your cat's unique needs.
          </p>
          <div style={{ color: themeColors.textSecondary }} className="mt-3">Version 2.0</div>
        </div>

        {onLogout && (
          <div className="space-y-2">
            <h3 className="px-2" style={{ color: themeColors.textSecondary }}>Account</h3>
            <div className="rounded-2xl overflow-hidden border border-border" style={{
              backgroundColor: themeColors.background,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between p-4 active:opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                    backgroundColor: '#dc262620'
                  }}>
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-normal" style={{ color: themeColors.text }}>Logout</div>
                    <div className="font-normal" style={{ color: themeColors.textSecondary }}>Clear all data and start over</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unit Settings Modal */}
      {showUnitSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3B2E25]">Unit Preferences</h3>
              <button
                onClick={() => setShowUnitSettings(false)}
                className="p-1 rounded-lg hover:bg-[#E8D8C8] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-[#6E5C50]" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[#6E5C50] mb-3 block">Weight Unit</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleWeightUnitChange('kg')}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                      appSettings.unitPreferences.weight === 'kg'
                        ? 'bg-primary text-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                  <button
                    onClick={() => handleWeightUnitChange('lb')}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                      appSettings.unitPreferences.weight === 'lb'
                        ? 'bg-primary text-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    Pounds (lb)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-3 block">Portion Unit</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePortionUnitChange('g')}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                      appSettings.unitPreferences.portion === 'g'
                        ? 'bg-primary text-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    onClick={() => handlePortionUnitChange('cup')}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center ${
                      appSettings.unitPreferences.portion === 'cup'
                        ? 'bg-primary text-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    Cups
                  </button>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  Note: 1 cup dry food ≈ 100g, 1 cup wet food ≈ 240g
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowUnitSettings(false)}
              className="w-full mt-6 py-3 rounded-xl bg-primary text-foreground active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-[#3B2E25] text-center mb-2">Logout?</h3>
            <p className="text-[#6E5C50] text-center mb-6">
              This will clear all your cat's profile data, feeding plans, and logs. This
              action cannot be undone.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="w-full py-4 rounded-2xl bg-red-600 text-white transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 rounded-2xl bg-[#E8D8C8] text-[#3B2E25] transition-all active:scale-[0.98] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentPage="profile" onNavigate={onNavigate} />
    </div>
  );
}
