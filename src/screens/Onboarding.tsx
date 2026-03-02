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
      title: 'Beyond the Packaging Label',
      subtitle: 'Stop relying on one-size-fits-all feeding charts.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-5xl mb-2">📦</div>
          <div className="space-y-3 w-full px-4">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">❌</span>
              <span className="text-sm text-muted-foreground">Static packaging tables designed for average cats</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">❌</span>
              <span className="text-sm text-muted-foreground">Guessing portions based on your cat's appetite</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">❌</span>
              <span className="text-sm text-muted-foreground">Manual adjustments with spreadsheets or notes</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Science-Backed Portions',
      subtitle: 'Personalized calculations based on NRC research standards.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-5xl mb-2">🔬</div>
          <div className="space-y-3 w-full px-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-sm text-foreground">Age, weight & activity level analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-sm text-foreground">Veterinary research-backed calculations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-sm text-foreground">Covers diet sensitivities & health conditions</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Weekly Adaptation',
      subtitle: 'Plans adjust automatically as your cat\'s weight changes.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-5xl mb-2">📈</div>
          <div className="space-y-4 w-full px-4">
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Week 1: Target 250g</p>
              <p className="text-sm font-medium text-foreground">Log daily portions</p>
            </div>
            <div className="text-center text-xs text-muted-foreground">↓</div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Week 2: +0.2kg detected</p>
              <p className="text-sm font-medium text-foreground">New target: 240g</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground pt-2">
            Feedback loop closes—no manual recalculation needed.
          </p>
        </div>
      ),
    },
    {
      title: 'Perfect for Multi-Cat Homes',
      subtitle: 'Manage each cat independently—single or multiple profiles.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-5xl mb-2">👥</div>
          <div className="space-y-3 w-full px-4">
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-sm font-medium text-foreground">Mittens (3kg, indoor)</p>
              <p className="text-xs text-muted-foreground">Daily target: 220 kcal</p>
            </div>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-sm font-medium text-foreground">Whisker (5kg, active)</p>
              <p className="text-xs text-muted-foreground">Daily target: 350 kcal</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ready to Get Started?',
      subtitle: 'Create your cat\'s first profile in under 2 minutes.',
      content: (
        <div className="flex flex-col items-center justify-center h-auto space-y-4">
          <div className="text-7xl animate-bounce">🐱</div>
          <div className="space-y-2 text-center">
            <p className="text-foreground font-medium">Tell us about your cat</p>
            <p className="text-sm text-muted-foreground px-4">
              We'll calculate the perfect portion plan based on their unique needs.
            </p>
          </div>
          <p className="text-center text-foreground text-sm tracking-wider mt-4 font-light">
            <span className="block text-xs text-muted-foreground mb-2">✨ ✨ ✨</span>
            Science-backed daily. Adapted weekly.
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
