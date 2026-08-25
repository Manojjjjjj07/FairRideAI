import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  icon?:      React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-wide">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`input-glass ${icon ? 'input-glass-has-icon !pl-11' : ''} ${error ? 'error' : ''} ${className}`}
          style={icon ? { paddingLeft: '2.75rem' } : undefined}
          {...props}
        />


      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-400/70 mt-0.5">{hint}</p>
      )}
    </div>
  );
}
