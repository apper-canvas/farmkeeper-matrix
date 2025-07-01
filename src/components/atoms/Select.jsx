import React from 'react';

const Select = ({ 
  label, 
  options = [], 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error 
            ? 'border-error focus:border-error' 
            : 'border-gray-200 focus:border-primary hover:border-gray-300'
        } bg-white text-gray-900`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Select;