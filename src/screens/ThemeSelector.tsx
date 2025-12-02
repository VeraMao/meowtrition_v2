import React, { useState } from 'react';
import { ChevronLeft, Palette } from 'lucide-react';
import { ThemeName } from '../types';
import { themes, getAvailableThemes } from '../utils/themes';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onBack: () => void;
  onUpdateTheme: (theme: ThemeName) => void;
}

export function ThemeSelector({ currentTheme, onBack, onUpdateTheme }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentTheme);

  const handleConfirm = () => {
    onUpdateTheme(selectedTheme);
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 -ml-2 active:scale-95">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-foreground">Choose Your Theme</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-muted">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-secondary" />
            <span className="text-foreground">Select a theme inspired by your cat's colors</span>
          </div>
        </div>

        {/* Theme Options */}
        <div className="space-y-3">
          {getAvailableThemes().map((theme) => {
            const themeColors = themes[theme.id];
            const isSelected = selectedTheme === theme.id;
            
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`w-full p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'ring-2 ring-primary bg-card shadow-md'
                    : 'bg-card border border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground">{theme.name}</h4>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">{theme.description}</p>
                  </div>
                </div>
                
                {/* Color Swatches */}
                <div className="flex gap-2 mt-3">
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: themeColors.secondary }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ 
                      backgroundColor: themeColors.background,
                      borderColor: 'rgba(59, 46, 37, 0.1)'
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{ backgroundColor: themeColors.muted }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="pt-4">
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl bg-primary text-foreground active:scale-[0.98] transition-all flex items-center justify-center shadow-sm"
          >
            Confirm Theme
          </button>
        </div>
      </div>
    </div>
  );
}
