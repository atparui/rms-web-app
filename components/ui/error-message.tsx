'use client';

import { AlertCircle } from 'lucide-react';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

/**
 * Error message component
 * Shows an error message with icon
 * 
 * @example
 * <ErrorMessage message="Failed to load restaurants" />
 * <ErrorMessage
 *   title="Connection Error"
 *   message="Unable to connect to the server"
 * />
 */
export function ErrorMessage({
  title = 'Error',
  message,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-lg border border-destructive bg-destructive/10 p-4 ${className || ''}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-destructive mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
