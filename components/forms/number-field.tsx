'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface NumberFieldProps {
  id?: string;
  label: string;
  value: number | undefined;
  onChange?: (value: number) => void;
  onValueChange?: (value: number | undefined) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/**
 * Reusable number input field with label, validation, and error display
 * 
 * @example
 * <NumberField
 *   id="basePrice"
 *   label="Base Price"
 *   value={formData.basePrice}
 *   onChange={(value) => handleChange('basePrice', value)}
 *   min={0}
 *   step={0.01}
 *   required
 * />
 */
export function NumberField({
  id: idProp,
  label,
  value,
  onChange,
  onValueChange,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  min,
  max,
  step = 1,
  className,
}: NumberFieldProps) {
  const id = idProp ?? label.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const handleChange = onChange ?? (v => onValueChange?.(v));
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        value={value || ''}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={error ? 'border-destructive' : className}
      />
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
