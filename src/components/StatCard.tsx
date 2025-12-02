import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="text-foreground mt-2">{value}</div>
      {subtitle && <div className="text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}
