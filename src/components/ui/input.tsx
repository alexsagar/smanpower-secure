import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4 border bg-white text-brand-charcoal text-sm transition-colors placeholder:text-brand-muted focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-brand-charcoal/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

// ── Textarea ─────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border bg-white text-brand-charcoal text-sm transition-colors placeholder:text-brand-muted focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold resize-y min-h-[120px]",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-brand-charcoal/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

// ── Select ───────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "w-full h-11 px-4 border bg-white text-brand-charcoal text-sm transition-colors focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold appearance-none",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-brand-charcoal/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

// ── Label ────────────────────────────────────────────

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-brand-charcoal mb-1.5",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export { Label };

// ── FormField ────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

function FormField({
  label,
  required,
  error,
  children,
  htmlFor,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };
