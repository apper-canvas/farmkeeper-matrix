import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Header = ({ onMenuToggle, title = "Dashboard" }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-4"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 font-display">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sync Status */}
          <div className="flex items-center px-3 py-1.5 bg-success/10 text-success rounded-full">
            <ApperIcon name="Wifi" className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Synced</span>
          </div>
          
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <ApperIcon name="Bell" className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <ApperIcon name="Settings" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;