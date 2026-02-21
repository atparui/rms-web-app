'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TextFieldProps {
  id?: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'time' | 'date';
  maxLength?: number;
  className?: string;
}

/**
 * Reusable text input field with label, validation, and error display
 * 
 * @example
 * <TextField
 *   id="name"
 *   label="Restaurant Name"
 *   value={formData.name}
 *   onChange={(value) => handleChange('name', value)}
 *   required
 *   placeholder="Enter restaurant name"
 * />
 */
export function TextField({
  id: idProp,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  helpText,
  type = 'text',
  maxLength,
  className,
}: TextFieldProps) {
  const id = idProp ?? label.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={error ? 'border-destructive' : className}
      />
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
