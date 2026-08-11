import React from 'react';

export interface RadioOptionProps {
  id: string;
  name: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  badgeText?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  id,
  name,
  value,
  selectedValue,
  onChange,
  title,
  description,
  badgeText,
  icon,
  disabled = false,
}) => {
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => !disabled && onChange(value)}
      className={`relative flex items-start p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-indigo-50/50 border-indigo-700 ring-2 ring-indigo-700/20 shadow-xs'
          : 'bg-white border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex items-center h-5 mr-3 mt-0.5">
        <div
          className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
            isSelected
              ? 'border-indigo-800 bg-indigo-800'
              : 'border-stone-300 bg-white'
          }`}
        >
          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>

      {icon && <div className="mr-3 text-indigo-900 mt-0.5">{icon}</div>}

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-semibold text-slate-900 cursor-pointer">
            {title}
          </label>
          {badgeText && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              {badgeText}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
      </div>
    </div>
  );
};
