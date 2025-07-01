import React from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ 
  type = 'input', 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  error,
  required = false,
  className = '',
  ...props 
}) => {
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const fieldProps = {
    value: value || '',
    onChange: handleChange,
    error,
    required,
    ...props
  };

  return (
    <div className={className}>
      {type === 'select' ? (
        <Select
          label={label}
          options={options}
          {...fieldProps}
        />
      ) : (
        <Input
          label={label}
          type={type}
          {...fieldProps}
        />
      )}
    </div>
  );
};

export default FormField;