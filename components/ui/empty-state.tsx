'use client';

import { FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state component
 * Shows when no data is available
 * 
 * @example
 * <EmptyState
 *   title="No restaurants found"
 *   description="Get started by creating your first restaurant"
 *   action={
 *     <Link href="/restaurants/create">
 *       <Button>
 *         <Plus className="mr-2 h-4 w-4" />
 *         Create Restaurant
 *       </Button>
 *     </Link>
 *   }
 * />
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed p-12 text-center ${className || ''}`}
    >
      <div className="flex flex-col items-center justify-center">
        {icon || (
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-2 max-w-md">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
