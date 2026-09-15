import React from 'react';
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface BaseFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    BaseFieldProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      required,
      leftIcon,
      rightIcon,
      containerClassName = '',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const borderClass = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : success
      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
      : 'border-slate-300 focus:ring-emerald-600 focus:border-emerald-600';

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || error || success ? 'pr-10' : ''} ${borderClass} ${className}`}
            {...props}
          />

          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : success ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              rightIcon
            )}
          </div>
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, success, required, containerClassName = '', className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const borderClass = error
      ? 'border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-500 focus:ring-green-500'
      : 'border-slate-300 focus:ring-emerald-600';

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`w-full min-h-[96px] p-3 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition disabled:bg-slate-100 ${borderClass} ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    BaseFieldProps {
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, required, options, containerClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <select
          id={inputId}
          ref={ref}
          className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const SearchInput: React.FC<TextInputProps> = (props) => (
  <TextInput leftIcon={<Search className="w-4 h-4" />} placeholder="Search products, orders, records..." {...props} />
);
