'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

/**
 * Reusable select dropdown field with label, validation, and error display
 * 
 * @example
 * <SelectField
 *   id="restaurantId"
 *   label="Restaurant"
 *   value={formData.restaurantId}
 *   onChange={(value) => handleChange('restaurantId', value)}
 *   options={restaurants.map(r => ({ value: r.id, label: r.name }))}
 *   required
 *   placeholder="Select a restaurant"
 * />
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  className,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={error ? 'border-destructive' : className}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
