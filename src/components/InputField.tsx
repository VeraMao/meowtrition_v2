import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  unit?: string;
}

export function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  unit,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (type === 'number') {
      const numValue = parseFloat(inputValue);
      if (inputValue === '' || numValue >= 0) {
        onChange(inputValue);
      }
    } else {
      onChange(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[#6E5C50]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4CDA5] focus:border-transparent text-[#3B2E25]"
          style={{ border: '1px solid rgba(59, 46, 37, 0.1)' }}
          {...(type === 'number' && { min: '0' })}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E5C50]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
