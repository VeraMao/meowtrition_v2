import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Volume2, VolumeX, Zap, TrendingDown, Users, Palette, CheckCircle } from 'lucide-react';
import { themes } from '../utils/themes';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const meowSound = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const playMeow = () => {
    if (soundEnabled && meowSound) {
      meowSound.currentTime = 0;
      meowSound.play().catch(() => {
        // Silent fail if audio cannot play
      });
    }
  };

  useEffect(() => {
    playMeow();
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setDirection('next');
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection('prev');
      setCurrentPage(currentPage - 1);
    }
  };

  const pages = [
    {
      title: 'Every Cat Is Unique',
      subtitle: 'No more guessing — we calculate the right portion for your cat\'s needs.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F938b4fdfb7eb476d94e8aab83ef48cbb%2Fef1f84f0c36c4b6586f42eaa5c095e09?format=webp&width=800"
            alt="Cat silhouettes - Kitten, Adult, Chubby"
            className="h-40 object-contain"
          />
          <p className="text-center text-muted-foreground text-sm px-4 pt-2">
            Each cat gets a personalized plan based on age, weight, and activity level.
          </p>
        </div>
      ),
    },
    {
      title: 'Science You Can Trust',
      subtitle: 'We use NRC research standards — safe and accurate.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F938b4fdfb7eb476d94e8aab83ef48cbb%2F8a54b30b52554a2eaed2f87bd154bfca?format=webp&width=800"
            alt="Chart with heart icon showing nutrition standards"
            className="h-40 object-contain"
          />
          <div className="space-y-3 w-full px-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs text-foreground">NRC Nutritional Standards</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs text-foreground">Veterinary Research-Backed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs text-foreground">Continuously Updated Data</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Track Meals & Progress',
      subtitle: 'Celebrate healthy milestones with visual progress and daily insights.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#E8D8C8" strokeWidth="8" />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#F4CDA5"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset="71"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <text x="100" y="110" textAnchor="middle" className="text-4xl fill-foreground font-bold">
                75%
              </text>
            </svg>
          </div>
          <p className="text-center text-muted-foreground text-sm px-4">
            Monitor daily intake, track trends over 30 days, and watch your cat thrive.
          </p>
        </div>
      ),
    },
    {
      title: 'Perfect for Multi-Cat Families',
      subtitle: 'Switch between profiles and manage each cat\'s plan separately.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F938b4fdfb7eb476d94e8aab83ef48cbb%2Fdc6c7dac88c54297ac69afab3ceaec08?format=webp&width=800"
            alt="Two cats side by side - orange tabby and cream colored cat"
            className="h-40 object-contain"
          />
          <p className="text-center text-muted-foreground text-sm px-4 pt-2">
            Manage multiple cats with ease, each with their own feeding plan.
          </p>
        </div>
      ),
    },
    {
      title: 'Ready to Begin!',
      subtitle: 'Tell us about your cat so we can start planning healthier meals.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-7xl animate-bounce">🐾</div>
          <div className="space-y-2 text-center">
            <p className="text-foreground font-medium">Create Your Cat Profile</p>
            <p className="text-sm text-muted-foreground px-4">
              In just a few steps, we'll calculate the perfect meal plan for your furry friend.
            </p>
          </div>
          <p className="text-center text-foreground text-sm tracking-wider mt-4 font-light">
            <span className="block text-xs text-muted-foreground mb-2">✨ ✨ ✨</span>
            Small changes, big purrs
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground active:scale-95 transition-all"
        >
          Skip
        </button>

        <div className="flex gap-1">
          {pages.map((_, index) => (
            <div
              key={index}
              className="h-1 rounded-full transition-all"
              style={{
                width: index === currentPage ? '24px' : '8px',
                backgroundColor: index === currentPage ? 'var(--primary)' : 'var(--muted)',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--primary)20' }}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          ) : (
            <VolumeX className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          )}
        </button>
      </div>

      {/* Pawprint Trail */}
      <div className="flex justify-center gap-2 px-4 py-3">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`text-lg transition-all ${
              index < currentPage ? 'opacity-100 scale-100' : 'opacity-30 scale-75'
            }`}
          >
            🐾
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col justify-center overflow-hidden">
        <div
          className={`transition-all duration-500 ${
            direction === 'next'
              ? 'animate-slide-in-right'
              : 'animate-slide-in-left'
          }`}
        >
          <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
            {pages[currentPage].title}
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            {pages[currentPage].subtitle}
          </p>

          <div>{pages[currentPage].content}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 space-y-3 border-t border-border bg-card">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-medium"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {currentPage === pages.length - 1 ? (
            <>
              <span>Start Planning</span>
              <CheckCircle className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {currentPage > 0 && (
          <button
            onClick={handlePrev}
            className="w-full py-3 rounded-2xl text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-border"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        <div className="text-center text-xs text-muted-foreground pt-2">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
