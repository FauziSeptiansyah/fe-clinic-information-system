import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export function FormFieldWrapper({
  label,
  required,
  error,
  helperText,
  className,
  children,
}: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 font-bold">*</span>}
      </Label>
      {children}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      {error && <p className="text-xs font-medium text-red-600 animate-in fade-in-50">{error}</p>}
    </div>
  );
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, error, helperText, className, ...props }, ref) => {
    return (
      <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
        <Input ref={ref} className={cn(error && "border-red-500 focus-visible:ring-red-500")} {...props} />
      </FormFieldWrapper>
    );
  }
);
FormInput.displayName = "FormInput";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, error, helperText, className, ...props }, ref) => {
    return (
      <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
        <Textarea ref={ref} className={cn(error && "border-red-500 focus-visible:ring-red-500")} {...props} />
      </FormFieldWrapper>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export interface FormSelectProps extends BaseFieldProps {
  value?: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
}

export function FormSelect({
  label,
  required,
  error,
  helperText,
  className,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  options,
  disabled,
}: FormSelectProps) {
  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText} className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}
