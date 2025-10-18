
import React from 'react';

type InputType = 'text' | 'number' | 'date' | 'tel' | 'email' | 'textarea' | 'select' | 'checkbox';

interface FormFieldProps {
  label: string;
  name: string;
  type?: InputType;
  value?: string | number | boolean;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  checked,
  onChange,
  required = false,
  options = [],
  placeholder = '',
  className = '',
  rows = 3,
  disabled = false,
  min,
  max
}) => {
  const baseClasses = "w-full bg-casino-secondary border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold text-casino-text disabled:bg-casino-primary disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-casino-text-muted mb-1";

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return <textarea id={name} name={name} value={String(value || '')} onChange={onChange} required={required} placeholder={placeholder} rows={rows} className={baseClasses} disabled={disabled} />;
      case 'select':
        return (
          <select id={name} name={name} value={String(value || '')} onChange={onChange} required={required} className={baseClasses} disabled={disabled}>
            <option value="">{placeholder || 'Select...'}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center h-10">
            <input id={name} name={name} type="checkbox" checked={Boolean(checked)} onChange={onChange} className="h-4 w-4 rounded border-gray-600 bg-casino-secondary text-casino-gold focus:ring-casino-gold disabled:cursor-not-allowed no-print" disabled={disabled} />
             <span className="print-only-text">{Boolean(checked) ? 'Yes' : 'No'}</span>
          </div>
        );
      default:
        return <input id={name} name={name} type={type} value={String(value || '')} onChange={onChange} required={required} placeholder={placeholder} className={baseClasses} disabled={disabled} min={min} max={max} />;
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className={labelClasses}>
        {label} {required && <span className="text-casino-danger">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};