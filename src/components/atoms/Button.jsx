import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary shadow-md hover:shadow-lg transform hover:scale-105',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary shadow-md hover:shadow-lg transform hover:scale-105',
    accent: 'bg-gradient-to-r from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent shadow-md hover:shadow-lg transform hover:scale-105',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary focus:ring-primary bg-white',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-error shadow-md hover:shadow-lg transform hover:scale-105'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <ApperIcon name={icon} className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <ApperIcon name={icon} className={`${iconSizes[size]} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button;