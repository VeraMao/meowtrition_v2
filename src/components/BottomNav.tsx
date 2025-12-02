import React from 'react';
import { Home, FileText, BookOpen, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: 'dashboard' | 'library' | 'feeding-log' | 'profile';
  onNavigate: (page: 'dashboard' | 'library' | 'feeding-log' | 'profile') => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as const, icon: Home, label: 'Home' },
    { id: 'feeding-log' as const, icon: FileText, label: 'Log' },
    { id: 'library' as const, icon: BookOpen, label: 'Library' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-[390px] mx-auto">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all active:scale-95 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-primary' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
