import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 text-primary',
    secondary: 'from-secondary/10 to-secondary/5 text-secondary',
    accent: 'from-accent/10 to-accent/5 text-accent',
    success: 'from-success/10 to-success/5 text-success',
    warning: 'from-warning/10 to-warning/5 text-warning',
    error: 'from-error/10 to-error/5 text-error'
  };

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                className={`w-4 h-4 mr-1 ${trend === 'up' ? 'text-success' : 'text-error'}`}
              />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <ApperIcon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;