'use client';

import { RefreshCw } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Loading spinner component
 * Shows an animated spinner with optional text
 * 
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" text="Loading restaurants..." />
 */
export function LoadingSpinner({
  size = 'md',
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] ${className || ''}`}
    >
      <RefreshCw
        className={`${sizeClasses[size]} animate-spin text-primary`}
      />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
