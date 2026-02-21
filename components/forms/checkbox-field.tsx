'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface CheckboxFieldProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  description?: string;
}

/**
 * Reusable checkbox field with label and error display
 * 
 * @example
 * <CheckboxField
 *   id="isActive"
 *   label="Active"
 *   checked={formData.isActive}
 *   onChange={(checked) => handleChange('isActive', checked)}
 * />
 */
export function CheckboxField({
  id: idProp,
  label,
  checked,
  onChange,
  onCheckedChange,
  disabled,
  error,
  helpText,
  className,
}: CheckboxFieldProps) {
  const id = idProp ?? label.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const handleChange = (value: boolean | 'indeterminate') => {
    if (onChange) onChange(value === true);
    else onCheckedChange?.(value);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          className={className}
        />
        <Label
          htmlFor={id}
          className="cursor-pointer font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
