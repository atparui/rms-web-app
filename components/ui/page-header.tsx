'use client';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

/**
 * Page header component
 * Consistent header layout for all pages
 * 
 * @example
 * <PageHeader
 *   title="Restaurants"
 *   description="Manage all restaurants"
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
export function PageHeader({
  title,
  description,
  action,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {backButton && <div>{backButton}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
