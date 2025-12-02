import React from 'react';

interface ButtonPrimaryProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function ButtonPrimary({
  onClick,
  children,
  disabled = false,
  variant = 'primary',
}: ButtonPrimaryProps) {
  const baseClasses = 'w-full py-4 rounded-2xl transition-all duration-200 flex items-center justify-center';
  const variantClasses =
    variant === 'primary'
      ? 'bg-primary text-foreground active:bg-secondary'
      : 'bg-muted text-foreground active:bg-secondary';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {children}
    </button>
  );
}
