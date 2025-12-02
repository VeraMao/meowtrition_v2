import React, { useState } from 'react';
import { Plus, Scale, ChevronDown, Users } from 'lucide-react';
import { CatProfile, FoodItem, FeedingPlan, FeedingLog, WeightUnit } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BottomNav } from '../components/BottomNav';
import { formatWeightForDisplay, getBodyConditionLabel } from '../utils/calculations';
import { AddFeedingModal } from '../components/AddFeedingModal';
import logoImage from 'figma:asset/766253ad1c0235a97d8d200e2889c88b9bd34c4e.png';

interface DashboardProps {
  catProfile: CatProfile;
  selectedFood: FoodItem;
  feedingPlan: FeedingPlan;
  feedingLogs: FeedingLog[];
  foods: FoodItem[];
  onAddLog: (log: Omit<FeedingLog, 'id'>) => void;
  onNavigateToLog: () => void;
  onNavigateToSettings: () => void;
  onNavigateToLibrary: () => void;
  allProfiles?: CatProfile[];
  onSwitchProfile?: (profileId: string) => void;
  defaultWeightUnit?: WeightUnit;
}

export function Dashboard({
  catProfile,
  selectedFood,
  feedingPlan,
  feedingLogs,
  foods,
  onAddLog,
  onNavigateToLog,
  onNavigateToSettings,
  onNavigateToLibrary,
  allProfiles = [],
  onSwitchProfile,
  defaultWeightUnit = 'kg',
}: DashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const getDisplayWeight = (profile: CatProfile) => {
    const unit = profile.weightUnitPreference || defaultWeightUnit;
    return formatWeightForDisplay(profile.currentWeight, unit);
  };

  const today = new Date().toDateString();
  const todayLogs = feedingLogs.filter(
    (log) => new Date(log.timestamp).toDateString() === today
  );
  const todayCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const todayGrams = todayLogs.reduce((sum, log) => sum + log.grams, 0);
  const progress = (todayCalories / feedingPlan.totalCaloriesPerDay) * 100;
  const amTarget = feedingPlan.amGrams ?? feedingPlan.totalGramsPerDay / 2;
  const pmTarget = feedingPlan.pmGrams ?? feedingPlan.totalGramsPerDay - amTarget;

  const handleAddLog = (foodId: string, grams: number, calories: number, timestamp?: Date) => {
    onAddLog({
      timestamp: timestamp || new Date(),
      grams,
      foodId,
      calories,
    });
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = last7Days.map((date) => {
    const dateStr = date.toDateString();
    const dayLogs = feedingLogs.filter(
      (log) => new Date(log.timestamp).toDateString() === dateStr
    );
    const dayCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayCalories,
      goal: feedingPlan.totalCaloriesPerDay,
    };
  });

  const timeBuckets = [
    { id: 'morning', label: 'Morning', startHour: 0, endHour: 12, targetGrams: Math.round(amTarget) },
    { id: 'evening', label: 'Evening', startHour: 12, endHour: 24, targetGrams: Math.round(pmTarget) },
  ];

  const alreadyFedByBucket = timeBuckets.map((bucket) => {
    const logs = todayLogs.filter((log) => {
      const hour = new Date(log.timestamp).getHours();
      return hour >= bucket.startHour && hour < bucket.endHour;
    });
    const grams = logs.reduce((sum, log) => sum + log.grams, 0);
    const calories = logs.reduce((sum, log) => sum + log.calories, 0);
    return {
      ...bucket,
      grams,
      calories,
      progress: bucket.targetGrams > 0 ? Math.min(100, (grams / bucket.targetGrams) * 100) : 0,
    };
  });

  const alreadyFedSummary = (
    <div className="space-y-3 mb-4">
      {alreadyFedByBucket.map((bucket) => (
        <div key={bucket.id} className="bg-muted rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{bucket.label}</div>
              <div className="text-foreground text-lg">
                {Math.round(bucket.grams)}g
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Target {bucket.targetGrams}g
            </div>
          </div>
          <div className="h-2 bg-card rounded-full mt-3">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${bucket.progress}%` }}
            />
          </div>
          {bucket.calories > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round(bucket.calories)} kcal logged
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <div className="bg-gradient-to-b from-muted to-transparent pt-6 pb-8">
        <div className="px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex-shrink-0">
              <img src={logoImage} alt="Meowtrition" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-muted-foreground flex items-center gap-2">
                <span>Hello!</span>
                {allProfiles.length > 1 && (
                  <span className="bg-primary text-foreground px-2 py-0.5 rounded-full text-xs">
                    {allProfiles.length} cats
                  </span>
                )}
              </div>
              {allProfiles.length > 1 && onSwitchProfile ? (
                <button
                  onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                  className="flex items-center gap-2 active:scale-95 transition-all"
                >
                  <h1 className="text-foreground">{catProfile.name}'s Plan</h1>
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      showProfileSwitcher ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              ) : (
                <h1 className="text-foreground">{catProfile.name}'s Plan</h1>
              )}
            </div>
          </div>

          {showProfileSwitcher && allProfiles.length > 1 && onSwitchProfile && (
            <div className="mb-4 bg-card rounded-2xl overflow-hidden animate-[slideDown_0.2s_ease-out] shadow-lg">
              <div className="p-3 bg-muted border-b border-border">
                <div className="text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Switch Cat</span>
                </div>
              </div>
              {allProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onSwitchProfile(profile.id);
                    setShowProfileSwitcher(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 active:bg-muted transition-colors last:border-b-0 ${
                    profile.id === catProfile.id ? 'bg-muted' : ''
                  }`}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl">🐱</div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{profile.name}</span>
                      {profile.id === catProfile.id && (
                        <span className="bg-primary text-foreground px-2 py-0.5 rounded-full text-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{getDisplayWeight(profile)} • {profile.age} years</span>
                      {!profile.feedingPlan && (
                        <span className="text-xs text-secondary">• No plan</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <ProgressRing progress={progress} size={180} />
          </div>

          <div className="text-center">
            <div className="text-foreground mb-1">
              {Math.round(todayCalories)} / {Math.round(feedingPlan.totalCaloriesPerDay)} kcal
            </div>
            <div className="text-muted-foreground">
              {Math.round(todayGrams)} / {Math.round(feedingPlan.totalGramsPerDay)} grams fed today
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          <h3 className="text-foreground mb-3">Current Meal Plan</h3>
          {alreadyFedSummary}
        </div>

        {catProfile.bodyCondition && (
          <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-muted-foreground mb-1">Body Condition</div>
                <div
                  className={`flex items-center gap-2 ${
                    catProfile.bodyCondition === 'ideal'
                      ? 'text-green-600'
                      : catProfile.bodyCondition === 'underweight' ||
                        catProfile.bodyCondition === 'very-underweight'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                >
                  <span>{getBodyConditionLabel(catProfile.bodyCondition)}</span>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      catProfile.bodyCondition === 'ideal'
                        ? 'bg-green-100'
                        : catProfile.bodyCondition === 'underweight' ||
                          catProfile.bodyCondition === 'very-underweight'
                        ? 'bg-orange-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {catProfile.bodyCondition === 'ideal' ? '✓ Healthy' : '⚠ Monitor'}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  catProfile.bodyCondition === 'ideal'
                    ? 'bg-green-100'
                    : catProfile.bodyCondition === 'underweight' ||
                      catProfile.bodyCondition === 'very-underweight'
                    ? 'bg-orange-100'
                    : 'bg-red-100'
                }`}
              >
                <Scale
                  className={`w-6 h-6 ${
                    catProfile.bodyCondition === 'ideal'
                      ? 'text-green-600'
                      : catProfile.bodyCondition === 'underweight' ||
                        catProfile.bodyCondition === 'very-underweight'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">7-Day Intake</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={4}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="calories" fill="var(--primary)" radius={[8, 8, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-3 h-3 border-2 border-secondary rounded-full" />
              <span className="text-muted-foreground">
                Goal: {Math.round(feedingPlan.totalCaloriesPerDay)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Recent Feedings section added back */}
        <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
          <h3 className="text-foreground mb-3">Recent Feedings</h3>
          {todayLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No feedings logged today</p>
          ) : (
            <div className="space-y-3">
              {todayLogs.slice(0, 3).map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 last:border-0 border-b border-border"
                  style={{ borderBottom: index < todayLogs.slice(0, 3).length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div>
                    <div className="text-foreground">{log.grams}g</div>
                    <div className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-muted-foreground">{Math.round(log.calories)} kcal</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button & Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="max-w-[390px] mx-auto relative pointer-events-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="absolute bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center active:scale-95 shadow-lg z-10"
          >
            <Plus className="w-6 h-6 text-foreground" />
          </button>

          <BottomNav
            currentPage="dashboard"
            onNavigate={(page) => {
              if (page === 'feeding-log') onNavigateToLog();
              else if (page === 'library') onNavigateToLibrary();
              else if (page === 'profile') onNavigateToSettings();
            }}
          />
        </div>
      </div>

      {showAddModal && (
        <AddFeedingModal
          onClose={() => setShowAddModal(false)}
          onAddLog={handleAddLog}
          feedingPlan={feedingPlan}
          foods={foods}
          selectedFoodIds={catProfile.selectedFoodIds}
          onNavigateToFoodLibrary={() => {
            setShowAddModal(false);
            onNavigateToLibrary();
          }}
        />
      )}
    </div>
  );
}
