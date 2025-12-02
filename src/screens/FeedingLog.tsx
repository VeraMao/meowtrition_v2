import React, { useState } from 'react';
import { ChevronLeft, Calendar, TrendingUp, Plus } from 'lucide-react';
import { FeedingLog as FeedingLogType, FoodItem, FeedingPlan } from '../types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BottomNav } from '../components/BottomNav';
import { AddFeedingModal } from '../components/AddFeedingModal';

interface FeedingLogProps {
  feedingLogs: FeedingLogType[];
  foods: FoodItem[];
  feedingPlan: FeedingPlan;
  selectedFood: FoodItem;
  onAddLog: (log: Omit<FeedingLogType, 'id'>) => void;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => void;
  userLibraryFoodIds?: string[];
  selectedFoodIds?: string[];
}

export function FeedingLog({ feedingLogs, foods, feedingPlan, selectedFood, onAddLog, onNavigate, userLibraryFoodIds, selectedFoodIds }: FeedingLogProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartColors, setChartColors] = useState({ primary: '#F4CDA5', secondary: '#D1A27B', muted: '#E8D8C8' });

  React.useEffect(() => {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--primary').trim();
    const secondary = getComputedStyle(root).getPropertyValue('--secondary').trim();
    const muted = getComputedStyle(root).getPropertyValue('--muted').trim();
    setChartColors({ primary, secondary, muted });
  }, []);

  const handleAddLog = (foodId: string, grams: number, calories: number, timestamp?: Date) => {
    onAddLog({
      timestamp: timestamp || new Date(),
      grams,
      foodId,
      calories,
    });
  };

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const chartData = last30Days.map((date) => {
    const dateStr = date.toDateString();
    const dayLogs = feedingLogs.filter(
      (log) => new Date(log.timestamp).toDateString() === dateStr
    );
    const dayCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);

    return {
      date: date.getDate(),
      calories: dayCalories,
      goal: feedingPlan.totalCaloriesPerDay,
    };
  });

  const groupedLogs = feedingLogs.reduce((acc, log) => {
    const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(log);
    return acc;
  }, {} as Record<string, FeedingLogType[]>);

  const sortedDates = Object.keys(groupedLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalFeedings = feedingLogs.length;
  const avgCaloriesPerDay =
    feedingLogs.length > 0
      ? feedingLogs.reduce((sum, log) => sum + log.calories, 0) / 30
      : 0;

  const streakDays = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      const hasLogs = feedingLogs.some(
        (log) => new Date(log.timestamp).toDateString() === dateStr
      );
      if (hasLogs) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <div className="bg-card sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <h2 className="text-foreground flex-1">Feeding Log</h2>
        </div>
      </div>

      <div className="p-6 pt-8 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-4 border border-border" style={{
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
          }}>
            <div className="mb-1" style={{ color: 'var(--muted-foreground)' }}>Streak</div>
            <div style={{ color: 'var(--foreground)' }}>{streakDays} days</div>
          </div>
          <div className="rounded-2xl p-4 border border-border" style={{
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
          }}>
            <div className="mb-1" style={{ color: 'var(--muted-foreground)' }}>Total</div>
            <div style={{ color: 'var(--foreground)' }}>{totalFeedings} feeds</div>
          </div>
          <div className="rounded-2xl p-4 border border-border" style={{
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
          }}>
            <div className="mb-1" style={{ color: 'var(--muted-foreground)' }}>Avg/Day</div>
            <div style={{ color: 'var(--foreground)' }}>{Math.round(avgCaloriesPerDay)} kcal</div>
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-border" style={{
          backgroundColor: 'var(--card)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
        }}>
          <h3 className="mb-4" style={{ color: 'var(--foreground)' }}>30-Day Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)'
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goal"
                stroke={chartColors.secondary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h3 style={{ color: 'var(--foreground)' }}>All Feedings</h3>
          {sortedDates.length === 0 ? (
            <div className="rounded-2xl p-8 text-center border border-border" style={{
              backgroundColor: 'var(--card)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}>
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
              <p style={{ color: 'var(--muted-foreground)' }}>No feedings logged yet</p>
            </div>
          ) : (
            sortedDates.map((dateStr) => {
              const logs = groupedLogs[dateStr];
              const totalGrams = logs.reduce((sum, log) => sum + log.grams, 0);
              const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);

              return (
                <div key={dateStr} className="rounded-2xl p-4 border border-border" style={{
                  backgroundColor: 'var(--card)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ color: 'var(--foreground)' }}>{dateStr}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>
                        {totalGrams}g • {Math.round(totalCalories)} kcal
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        totalCalories >= feedingPlan.totalCaloriesPerDay * 0.9 &&
                        totalCalories <= feedingPlan.totalCaloriesPerDay * 1.1
                          ? 'bg-green-100 text-green-700'
                          : totalCalories < feedingPlan.totalCaloriesPerDay * 0.9
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {totalCalories >= feedingPlan.totalCaloriesPerDay * 0.9 &&
                      totalCalories <= feedingPlan.totalCaloriesPerDay * 1.1
                        ? '✓ On track'
                        : totalCalories < feedingPlan.totalCaloriesPerDay * 0.9
                        ? '↓ Under'
                        : '↑ Over'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {logs.map((log, index) => {
                      const food = foods.find((f) => f.id === log.foodId);
                      const displayName = log.customFoodName || food?.name || 'Unknown';
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded-xl"
                          style={{ backgroundColor: `var(--primary)20` }}
                        >
                          <div>
                            <div style={{ color: 'var(--foreground)' }}>{log.grams}g</div>
                            <div style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div style={{ color: 'var(--foreground)' }}>{Math.round(log.calories)} kcal</div>
                            <div style={{ color: 'var(--muted-foreground)' }}>{displayName}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="max-w-[390px] mx-auto relative pointer-events-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="absolute bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center active:scale-95 shadow-lg z-10"
          >
            <Plus className="w-6 h-6 text-foreground" />
          </button>

          <BottomNav currentPage="feeding-log" onNavigate={onNavigate} />
        </div>
      </div>

      {showAddModal && (
        <AddFeedingModal
          onClose={() => setShowAddModal(false)}
          onAddLog={handleAddLog}
          feedingPlan={feedingPlan}
          foods={foods}
          selectedFoodIds={selectedFoodIds}
          onNavigateToFoodLibrary={() => {
            setShowAddModal(false);
            onNavigate('library');
          }}
        />
      )}
    </div>
  );
}
