import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { CatProfile, FeedingPlan, FoodItem } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
}

interface ActionButton {
  id: string;
  label: string;
  action: () => void;
}

interface FeedingCoachProps {
  catProfile: CatProfile;
  currentFeedingPlan: FeedingPlan;
  selectedFood: FoodItem;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile' | 'feeding-coach') => void;
}

export function FeedingCoach({
  catProfile,
  currentFeedingPlan,
  selectedFood,
  onNavigate,
}: FeedingCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationStage, setConversationStage] = useState<'initial' | 'analyzing' | 'suggestion' | 'adjustment'>('initial');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation on mount
  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  const startConversation = () => {
    // Generate initial greeting
    const greeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: `Hi ${catProfile.name}'s parent! 👋\nI've reviewed your cat's recent feeding data. Here's what I noticed:`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
    setConversationStage('analyzing');

    // Generate analysis after short delay
    setTimeout(() => {
      generateAnalysis();
    }, 800);
  };

  const generateAnalysis = () => {
    // Hardcoded logic based on simple conditions
    const recentLogs: any[] = []; // In real app, would get from props
    const weightTrend = 'stable'; // Simple logic: could be stable/increasing/decreasing
    const activityLevel = catProfile.activityLevel || 'medium';
    
    let analysisText = '';
    
    // Simple decision logic
    if (weightTrend === 'stable') {
      analysisText = `• Weight has remained stable\n• Daily intake is on target at ${currentFeedingPlan.totalCaloriesPerDay} kcal\n• Activity level: ${activityLevel}`;
    } else if (weightTrend === 'increasing') {
      analysisText = `• Weight shows a slight increase\n• Current intake: ${currentFeedingPlan.totalCaloriesPerDay} kcal\n• May benefit from a modest reduction`;
    }

    const analysis: ChatMessage = {
      id: `msg-${Date.now()}-1`,
      sender: 'ai',
      content: analysisText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, analysis]);

    // Follow-up suggestion
    setTimeout(() => {
      const suggestion: ChatMessage = {
        id: `msg-${Date.now()}-2`,
        sender: 'ai',
        content: `Based on this, would you like me to suggest any adjustments to the feeding plan?`,
        timestamp: new Date(),
        actions: [
          {
            id: 'yes-adjust',
            label: 'Yes, optimize',
            action: () => handleOptimize(),
          },
          {
            id: 'keep-plan',
            label: 'Keep current plan',
            action: () => handleKeepPlan(),
          },
          {
            id: 'tell-more',
            label: 'Tell me more',
            action: () => handleTellMore(),
          },
        ],
      };
      setMessages(prev => [...prev, suggestion]);
      setConversationStage('suggestion');
    }, 600);
  };

  const handleOptimize = () => {
    // Add user response
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Yes, optimize',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setConversationStage('adjustment');

    // AI recommendation
    setTimeout(() => {
      const adjustmentPercentage = 5;
      const newCalories = Math.round(
        currentFeedingPlan.totalCaloriesPerDay * (100 - adjustmentPercentage) / 100
      );
      const calorieReduction = currentFeedingPlan.totalCaloriesPerDay - newCalories;

      const recommendation: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `I recommend reducing daily intake from ${currentFeedingPlan.totalCaloriesPerDay} kcal to ${newCalories} kcal.\n\nThis is a ${adjustmentPercentage}% reduction—gentle enough to implement smoothly while helping achieve your goals.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, recommendation]);

      // Adjustment action
      setTimeout(() => {
        const actionMsg: ChatMessage = {
          id: `msg-${Date.now()}-2`,
          sender: 'ai',
          content: `New Daily Target: ${newCalories} kcal\nPrevious: ${currentFeedingPlan.totalCaloriesPerDay} kcal\n\nReady to apply this change?`,
          timestamp: new Date(),
          actions: [
            {
              id: 'apply-adj',
              label: 'Apply Adjustment',
              action: () => handleApplyAdjustment(newCalories),
            },
            {
              id: 'skip-adj',
              label: 'Not now',
              action: () => handleSkipAdjustment(),
            },
          ],
        };
        setMessages(prev => [...prev, actionMsg]);
      }, 600);
    }, 800);
  };

  const handleKeepPlan = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Keep current plan',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `Perfect! I'll continue monitoring ${catProfile.name}'s progress. Feel free to check back next week for an updated analysis.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    }, 600);
  };

  const handleTellMore = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Tell me more',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const infoMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `The adjustment works by slightly reducing daily portions, which can help with gradual, sustainable weight management.\n\nSmall changes (3-5%) are easier to stick with and less disruptive to your cat's routine.`,
        timestamp: new Date(),
        actions: [
          {
            id: 'yes-optimize',
            label: 'Yes, optimize',
            action: () => handleOptimize(),
          },
          {
            id: 'keep-current',
            label: 'Keep current',
            action: () => handleKeepPlan(),
          },
        ],
      };
      setMessages(prev => [...prev, infoMsg]);
    }, 800);
  };

  const handleApplyAdjustment = (newCalories: number) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Apply Adjustment',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `✓ Plan updated! I'll monitor ${catProfile.name}'s progress next week.\n\n💡 Tip: Spread the reduction across both meals for easier adjustment.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    }, 600);
  };

  const handleSkipAdjustment = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Not now',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `No problem! I'm here whenever you're ready. Have a great week with ${catProfile.name}! 🐱`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    }, 600);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-foreground">Feeding Coach</h2>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Status Summary Card */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-2xl p-4 border border-border" style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.04) 100%)',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
        }}>
          <h3 className="text-foreground font-semibold text-sm mb-3">Current Status</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Weight</span>
              <p className="text-foreground font-semibold">{catProfile.currentWeight} kg</p>
            </div>
            <div>
              <span className="text-muted-foreground">Daily Intake</span>
              <p className="text-foreground font-semibold">{currentFeedingPlan.totalCaloriesPerDay} kcal</p>
            </div>
            <div>
              <span className="text-muted-foreground">Body Score</span>
              <p className="text-foreground font-semibold">6/9</p>
            </div>
            <div>
              <span className="text-muted-foreground">Trend</span>
              <p className="text-foreground font-semibold">Stable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-3 ${
              message.sender === 'ai'
                ? 'bg-muted text-foreground rounded-bl-none'
                : 'bg-primary text-foreground rounded-br-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Action Buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`text-xs px-3 py-2 rounded-lg transition-all active:scale-95 ${
                        message.sender === 'ai'
                          ? 'bg-primary text-foreground hover:bg-primary/90'
                          : 'bg-white/20 text-foreground hover:bg-white/30'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 bg-primary text-foreground rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav currentPage="feeding-coach" onNavigate={onNavigate} />
    </div>
  );
}
