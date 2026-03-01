import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { CatProfile, FeedingPlan, FoodItem } from '../types';
import { BottomNav } from '../components/BottomNav';
import { calculateDailyFoodAmount } from '../utils/calculations';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
  isAnalyzing?: boolean;
}

interface ActionButton {
  id: string;
  label: string;
  action: () => void;
}

type ConversationState =
  | 'entry'
  | 'feeding-adjustment'
  | 'food-recommendation'
  | 'health-overview'
  | 'weekly-check-in'
  | 'follow-up';

type RecommendationCategory =
  | 'sensitive-stomach'
  | 'weight-control'
  | 'urinary-health'
  | 'high-protein'
  | 'exploring';

interface FoodCard {
  foodName: string;
  foodId?: string;
  reasons: string[];
}

interface FeedingCoachProps {
  catProfile: CatProfile;
  currentFeedingPlan: FeedingPlan;
  selectedFood: FoodItem;
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile' | 'feeding-coach') => void;
  onApplyPlanAdjustment?: (newCalories: number) => void;
  onViewFoodDetail?: (foodId: string) => void;
}

export function FeedingCoach({
  catProfile,
  currentFeedingPlan,
  selectedFood,
  onNavigate,
  onApplyPlanAdjustment,
  onViewFoodDetail,
}: FeedingCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>('entry');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && conversationState === 'entry') {
      startConversation();
    }
  }, []);

  const startConversation = () => {
    const greeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: `Hi ${catProfile.name}'s parent! 👋\nHow can I help you today?`,
      timestamp: new Date(),
      actions: [
        { id: 'adjust', label: 'Adjust feeding plan', action: () => handleSelectIntent('feeding-adjustment') },
        { id: 'check-in', label: 'Weekly check-in', action: () => handleSelectIntent('weekly-check-in') },
        { id: 'food', label: 'Food recommendation', action: () => handleSelectIntent('food-recommendation') },
        { id: 'health', label: 'Health risk overview', action: () => handleSelectIntent('health-overview') },
        { id: 'ask', label: 'Ask anything', action: () => handleSelectIntent('ask-anything') },
      ],
    };
    setMessages([greeting]);
  };

  const handleSelectIntent = (intent: string) => {
    if (intent !== 'ask-anything') {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: getIntentLabel(intent),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
    }

    switch (intent) {
      case 'feeding-adjustment':
        setConversationState('feeding-adjustment');
        setTimeout(() => generateFeedingAdjustmentFlow(), 300);
        break;
      case 'weekly-check-in':
        setConversationState('weekly-check-in');
        setTimeout(() => generateWeeklyCheckInFlow(), 300);
        break;
      case 'food-recommendation':
        setConversationState('food-recommendation');
        setTimeout(() => generateFoodRecommendationFlow(), 300);
        break;
      case 'health-overview':
        setConversationState('health-overview');
        setTimeout(() => generateHealthOverviewFlow(), 300);
        break;
      case 'ask-anything':
        setConversationState('follow-up');
        // Just focus on text input, no need to add message
        break;
    }
  };

  const getIntentLabel = (intent: string): string => {
    const labels: Record<string, string> = {
      'feeding-adjustment': 'Adjust feeding plan',
      'weekly-check-in': 'Weekly check-in',
      'food-recommendation': 'Food recommendation',
      'health-overview': 'Health risk overview',
      'ask-anything': 'Ask anything',
    };
    return labels[intent] || '';
  };

  const generateFeedingAdjustmentFlow = () => {
    // Show analyzing message
    const analyzingMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: 'Analyzing recent feeding data…',
      timestamp: new Date(),
      isAnalyzing: true,
    };
    setMessages(prev => [...prev, analyzingMsg]);

    setTimeout(() => {
      // Remove analyzing message and add analysis
      setMessages(prev => prev.filter(m => !m.isAnalyzing));

      const analysis: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `Based on the last 2 weeks:\n• Weight is stable\n• Current goal: weight loss\n• Body score: 6/9\n\nI recommend reducing intake by 5%.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, analysis]);

      setTimeout(() => {
        const actionMsg: ChatMessage = {
          id: `msg-${Date.now()}-2`,
          sender: 'ai',
          content: 'What would you like to do?',
          timestamp: new Date(),
          actions: [
            { id: 'apply-adj', label: 'Apply adjustment', action: () => handleApplyFeedingAdjustment() },
            { id: 'explain', label: 'Explain reasoning', action: () => handleExplainReasoning() },
            { id: 'keep', label: 'Keep current plan', action: () => handleKeepCurrentPlan() },
          ],
        };
        setMessages(prev => [...prev, actionMsg]);
      }, 600);
    }, 1200);
  };

  const handleApplyFeedingAdjustment = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Apply adjustment',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const adjustmentPercentage = 5;
    const newCalories = Math.round(
      currentFeedingPlan.totalCaloriesPerDay * (100 - adjustmentPercentage) / 100
    );

    setTimeout(() => {
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `✓ Plan updated!\n${currentFeedingPlan.totalCaloriesPerDay} kcal → ${newCalories} kcal\n\nI'll monitor ${catProfile.name}'s progress next week.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);

      // Call the callback to actually update the plan in App
      if (onApplyPlanAdjustment) {
        onApplyPlanAdjustment(newCalories);
      }

      setTimeout(() => showContinueHelping(), 600);
    }, 600);
  };

  const handleExplainReasoning = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Explain reasoning',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const explanation: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `A 5% reduction is gentle but effective. This approach:\n• Prevents rapid changes that stress your cat\n• Supports gradual, sustainable weight loss\n• Fits naturally into daily feeding routines`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, explanation]);

      setTimeout(() => {
        const followUp: ChatMessage = {
          id: `msg-${Date.now()}-2`,
          sender: 'ai',
          content: 'Ready to apply it?',
          timestamp: new Date(),
          actions: [
            { id: 'apply', label: 'Yes, apply', action: () => handleApplyFeedingAdjustment() },
            { id: 'keep', label: 'Keep current', action: () => handleKeepCurrentPlan() },
          ],
        };
        setMessages(prev => [...prev, followUp]);
      }, 600);
    }, 600);
  };

  const handleKeepCurrentPlan = () => {
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
        content: `Perfect! I'll continue monitoring ${catProfile.name}'s progress.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);

      setTimeout(() => showContinueHelping(), 600);
    }, 600);
  };

  const generateWeeklyCheckInFlow = () => {
    const checkInMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: `It's time for our weekly check-in. Have you noticed any changes?`,
      timestamp: new Date(),
      actions: [
        { id: 'eating-more', label: 'Eating more', action: () => handleCheckInResponse('eating-more') },
        { id: 'eating-less', label: 'Eating less', action: () => handleCheckInResponse('eating-less') },
        { id: 'more-active', label: 'More active', action: () => handleCheckInResponse('more-active') },
        { id: 'no-change', label: 'No change', action: () => handleCheckInResponse('no-change') },
      ],
    };
    setMessages(prev => [...prev, checkInMsg]);
  };

  const handleCheckInResponse = (response: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: getCheckInLabel(response),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let replyContent = '';
      switch (response) {
        case 'eating-more':
          replyContent = `That's interesting! Increased appetite can indicate higher activity or a need for plan adjustment. Would you like me to recommend a small increase?`;
          break;
        case 'eating-less':
          replyContent = `Good observation. Lower appetite might mean ${catProfile.name}'s satisfied at current portions, or it could signal something to monitor. Let's watch closely.`;
          break;
        case 'more-active':
          replyContent = `Great news! More activity is excellent for overall health. This might allow for slightly higher calorie intake to fuel the activity.`;
          break;
        case 'no-change':
          replyContent = `Perfect! Stability is exactly what we want. ${catProfile.name}'s on a good track.`;
          break;
      }

      const replyMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: replyContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, replyMsg]);

      setTimeout(() => showContinueHelping(), 600);
    }, 600);
  };

  const getCheckInLabel = (response: string): string => {
    const labels: Record<string, string> = {
      'eating-more': 'Eating more',
      'eating-less': 'Eating less',
      'more-active': 'More active',
      'no-change': 'No change',
    };
    return labels[response] || '';
  };

  const generateFoodRecommendationFlow = () => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: 'What concern are we addressing?',
      timestamp: new Date(),
      actions: [
        { id: 'sensitive', label: 'Sensitive stomach', action: () => handleFoodRecommendation('sensitive-stomach') },
        { id: 'weight', label: 'Weight control', action: () => handleFoodRecommendation('weight-control') },
        { id: 'urinary', label: 'Urinary health', action: () => handleFoodRecommendation('urinary-health') },
        { id: 'protein', label: 'High protein', action: () => handleFoodRecommendation('high-protein') },
        { id: 'explore', label: 'Just exploring', action: () => handleFoodRecommendation('exploring') },
      ],
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleFoodRecommendation = (category: RecommendationCategory) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: getCategoryLabel(category),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Show analyzing message
    const analyzingMsg: ChatMessage = {
      id: `msg-${Date.now()}-1`,
      sender: 'ai',
      content: 'Analyzing veterinary guidelines and community comments…',
      timestamp: new Date(),
      isAnalyzing: true,
    };
    setMessages(prev => [...prev, analyzingMsg]);

    setTimeout(() => {
      // Remove analyzing message
      setMessages(prev => prev.filter(m => !m.isAnalyzing));

      const foodCards = generateFoodCards(category);
      const recommendationMsg: ChatMessage = {
        id: `msg-${Date.now()}-2`,
        sender: 'ai',
        content: `Based on veterinary guidelines and community feedback, here are recommended foods for ${getCategoryLabel(category).toLowerCase()}:`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, recommendationMsg]);

      // Add food cards as separate messages
      foodCards.forEach((card, index) => {
        setTimeout(() => {
          const cardMsg: ChatMessage = {
            id: `food-card-${Date.now()}-${index}`,
            sender: 'ai',
            content: `📌 ${card.foodName}\n\nWhy this is recommended:\n${card.reasons.map(r => `• ${r}`).join('\n')}`,
            timestamp: new Date(),
            actions: card.foodId ? [
              { id: `view-${card.foodId}`, label: 'View in Food Library →', action: () => handleViewFood(card.foodId!) }
            ] : [],
          };
          setMessages(prev => [...prev, cardMsg]);
        }, 300 + (index * 300));
      });

      // Add continue helping prompt after cards
      setTimeout(() => {
        showContinueHelping();
      }, 300 + (foodCards.length * 300) + 600);
    }, 1200);
  };

  const getCategoryLabel = (category: RecommendationCategory): string => {
    const labels: Record<RecommendationCategory, string> = {
      'sensitive-stomach': 'Sensitive stomach',
      'weight-control': 'Weight control',
      'urinary-health': 'Urinary health',
      'high-protein': 'High protein',
      'exploring': 'Just exploring options',
    };
    return labels[category];
  };

  const generateFoodCards = (category: RecommendationCategory): FoodCard[] => {
    const cards: Record<RecommendationCategory, FoodCard[]> = {
      'sensitive-stomach': [
        { foodName: 'Hill\'s Sensitive Stomach', foodId: 'hills-sensitive', reasons: ['Lower fat percentage', 'Highly digestible protein', 'Positive community reviews for vomiting reduction'] },
        { foodName: 'Royal Canin Digestive Care', foodId: 'rc-digestive', reasons: ['Specialized for GI sensitivity', 'Moderate protein', 'Easy to digest formula'] },
        { foodName: 'Purina Pro Plan Sensitive', foodId: 'purina-sensitive', reasons: ['Limited ingredients', 'Novel protein sources', 'High digestibility rating'] },
      ],
      'weight-control': [
        { foodName: 'Royal Canin Weight Control', foodId: 'rc-weight', reasons: ['Lower calorie density', 'High fiber for satiety', 'Supports weight management'] },
        { foodName: 'Hill\'s Science Diet Weight Management', foodId: 'hills-weight', reasons: ['Calorie-controlled formula', 'Increased fiber', 'Clinical study backed'] },
        { foodName: 'Purina Pro Plan Weight Management', foodId: 'purina-weight', reasons: ['Reduced calories per serving', 'High protein retention', 'Community approved'] },
      ],
      'urinary-health': [
        { foodName: 'Hill\'s Science Diet Urinary Care', foodId: 'hills-urinary', reasons: ['Magnesium controlled', 'FLUTD prevention formula', 'Veterinarian recommended'] },
        { foodName: 'Royal Canin Urinary SO', foodId: 'rc-urinary', reasons: ['Prevents crystal formation', 'Balanced minerals', 'Clinical effectiveness'] },
        { foodName: 'Purina Pro Plan Urinary Tract Health', foodId: 'purina-urinary', reasons: ['Mineral balance', 'Promotes healthy urinary pH', 'Prevention-focused'] },
      ],
      'high-protein': [
        { foodName: 'Taste of the Wild High Prairie', foodId: 'totw-prairie', reasons: ['35%+ protein', 'Grain-free with real meat', 'Natural ingredients'] },
        { foodName: 'Orijen Original', foodId: 'orijen-original', reasons: ['80% fresh meat ingredients', 'High biological value', 'Premium protein sources'] },
        { foodName: 'Acana Grasslands', foodId: 'acana-grasslands', reasons: ['Meat-first formula', 'High protein content', 'Limited carbohydrates'] },
      ],
      'exploring': [
        { foodName: 'Hill\'s Science Diet Adult', foodId: 'food-2', reasons: ['Complete and balanced nutrition', 'Veterinarian recommended', 'Supports overall cat health'] },
        { foodName: 'Natural Balance Limited Ingredient', foodId: 'nb-limited', reasons: ['Hypoallergenic potential', 'Quality ingredients', 'Good digestibility'] },
        { foodName: 'IAMS Proactive Health', foodId: 'iams-proactive', reasons: ['Balanced formula', 'Widely available', 'Good value'] },
      ],
    };
    return cards[category] || [];
  };

  const handleViewFood = (foodId: string) => {
    // Navigate to food detail page
    if (onViewFoodDetail) {
      onViewFoodDetail(foodId);
    }
  };

  const generateHealthOverviewFlow = () => {
    // Show analyzing message
    const analyzingMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: `Analyzing ${catProfile.name}'s health profile…`,
      timestamp: new Date(),
      isAnalyzing: true,
    };
    setMessages(prev => [...prev, analyzingMsg]);

    setTimeout(() => {
      setMessages(prev => prev.filter(m => !m.isAnalyzing));

      const healthMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `Based on ${catProfile.name}'s age (3y), weight (${catProfile.currentWeight}kg), and feeding pattern:\n\n• Obesity Risk: Moderate\n• Urinary Risk: Slightly Elevated\n• Diabetes Risk: Low`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, healthMsg]);

      setTimeout(() => {
        const actionMsg: ChatMessage = {
          id: `msg-${Date.now()}-2`,
          sender: 'ai',
          content: 'Would you like to know more about any of these?',
          timestamp: new Date(),
          actions: [
            { id: 'obesity', label: 'Reduce obesity risk', action: () => handleHealthRiskAction('obesity') },
            { id: 'urinary', label: 'How to reduce urinary risk', action: () => handleHealthRiskAction('urinary') },
            { id: 'diabetes', label: 'Prevent diabetes', action: () => handleHealthRiskAction('diabetes') },
          ],
        };
        setMessages(prev => [...prev, actionMsg]);
      }, 600);
    }, 1200);
  };

  const handleHealthRiskAction = (risk: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: getRiskLabel(risk),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let guidance = '';
      switch (risk) {
        case 'obesity':
          guidance = `Reduce calorie intake gradually (5-10% reduction)\nIncrease playtime and activity\nMonitor portion sizes closely\n\nInterested in suitable foods for weight control?`;
          break;
        case 'urinary':
          guidance = `Increase water intake (promote wet food)\nMaintain proper mineral balance\nRegular monitoring is key\n\nI can recommend foods for urinary health.`;
          break;
        case 'diabetes':
          guidance = `Maintain healthy weight\nKeep consistent feeding schedule\nMonitor for early signs\n\nLow-carb, high-protein diets can help.`;
          break;
      }

      const guidanceMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: guidance,
        timestamp: new Date(),
        actions: risk === 'obesity' || risk === 'urinary' ? [
          { id: 'food-rec', label: 'Recommend foods', action: () => showFoodRecommendationFromHealth(risk) }
        ] : [],
      };
      setMessages(prev => [...prev, guidanceMsg]);

      setTimeout(() => showContinueHelping(), 600);
    }, 600);
  };

  const getRiskLabel = (risk: string): string => {
    const labels: Record<string, string> = {
      'obesity': 'Reduce obesity risk',
      'urinary': 'How to reduce urinary risk',
      'diabetes': 'Prevent diabetes',
    };
    return labels[risk] || '';
  };

  const showFoodRecommendationFromHealth = (risk: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'Recommend foods',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const category: RecommendationCategory = risk === 'obesity' ? 'weight-control' : 'urinary-health';

    setTimeout(() => {
      const analyzingMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: 'Analyzing veterinary guidelines…',
        timestamp: new Date(),
        isAnalyzing: true,
      };
      setMessages(prev => [...prev, analyzingMsg]);

      setTimeout(() => {
        setMessages(prev => prev.filter(m => !m.isAnalyzing));

        const foodCards = generateFoodCards(category);
        foodCards.forEach((card, index) => {
          setTimeout(() => {
            const cardMsg: ChatMessage = {
              id: `food-card-${Date.now()}-${index}`,
              sender: 'ai',
              content: `📌 ${card.foodName}\n\nWhy this is recommended:\n${card.reasons.map(r => `• ${r}`).join('\n')}`,
              timestamp: new Date(),
              actions: card.foodId ? [
                { id: `view-${card.foodId}`, label: 'View in Food Library →', action: () => handleViewFood(card.foodId!) }
              ] : [],
            };
            setMessages(prev => [...prev, cardMsg]);
          }, 300 + (index * 300));
        });

        setTimeout(() => {
          showContinueHelping();
        }, 300 + (foodCards.length * 300) + 600);
      }, 1200);
    }, 600);
  };

  const showContinueHelping = () => {
    const continueMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      content: 'Can I help you with anything else?',
      timestamp: new Date(),
      actions: [
        { id: 'food', label: 'Food recommendation', action: () => handleSelectIntent('food-recommendation') },
        { id: 'health', label: 'Health insights', action: () => handleSelectIntent('health-overview') },
        { id: 'adjust', label: 'Adjust plan', action: () => handleSelectIntent('feeding-adjustment') },
        { id: 'no', label: 'No, thanks', action: () => handleEndConversation() },
      ],
    };
    setMessages(prev => [...prev, continueMsg]);
  };

  const handleEndConversation = () => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: 'No, thanks',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const byeMsg: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'ai',
        content: `Great! Feel free to reach out anytime. Cheers to ${catProfile.name}'s health! 🐱`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, byeMsg]);
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

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    const elements = [];
    let currentParagraph = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('•')) {
        // Flush current paragraph if it exists
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="text-sm mb-2">
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }

        // Add bullet point as a div
        elements.push(
          <div key={`bullet-${index}`} className="flex gap-2 mb-1 text-sm">
            <span className="text-primary flex-shrink-0">•</span>
            <span className="flex-1">{line.trim().substring(1).trim()}</span>
          </div>
        );
      } else if (line.trim() === '') {
        // Empty line - treat as paragraph break
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="text-sm mb-2">
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }
      } else {
        // Regular text line
        currentParagraph.push(line.trim());
      }
    });

    // Flush remaining paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`para-${lines.length}`} className="text-sm mb-2">
          {currentParagraph.join(' ')}
        </p>
      );
    }

    return elements.length > 0 ? elements : <p className="text-sm">{content}</p>;
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
            <h2 className="text-foreground font-semibold">Feeding Coach</h2>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'} px-2`}>
            <div className={`rounded-2xl px-4 py-3 ${
              message.sender === 'ai'
                ? 'bg-muted text-foreground rounded-bl-none'
                : 'bg-primary text-foreground rounded-br-none'
            }`} style={{
              ...(message.sender === 'ai' ? { backgroundColor: 'rgba(232, 216, 200, 0.34)' } : {}),
              maxWidth: 'calc(100% - 16px)',
            }}>
              {message.isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {renderMessageContent(message.content)}
                </div>
              )}

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
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
