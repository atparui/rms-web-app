'use client';

import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

export interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Form action buttons (Cancel / Submit)
 * Consistent button layout for form pages
 * 
 * @example
 * <FormActions
 *   onCancel={() => router.push('/restaurants')}
 *   submitText="Create Restaurant"
 *   isSubmitting={loading}
 * />
 */
export function FormActions({
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  disabled = false,
  className,
}: FormActionsProps) {
  return (
    <div className={`flex justify-end gap-4 ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="mr-2 h-4 w-4" />
        {cancelText}
      </Button>
      <Button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={isSubmitting || disabled}
      >
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Saving...' : submitText}
      </Button>
    </div>
  );
}
