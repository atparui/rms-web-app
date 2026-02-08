'use client';

import { Label } from '@/components/ui/label';

export interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * Reusable textarea field with label, validation, and error display
 * 
 * @example
 * <TextAreaField
 *   id="description"
 *   label="Description"
 *   value={formData.description}
 *   onChange={(value) => handleChange('description', value)}
 *   rows={4}
 *   placeholder="Enter description"
 * />
 */
export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  rows = 3,
  maxLength,
  className,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <textarea
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-destructive' : ''
        } ${className || ''}`}
      />
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
