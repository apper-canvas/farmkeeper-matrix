import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
      />
    </div>
  );
};

export default SearchBar;