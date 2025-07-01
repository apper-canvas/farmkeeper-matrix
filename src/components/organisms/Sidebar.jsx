import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Farms', href: '/farms', icon: 'MapPin' },
    { name: 'Crops', href: '/crops', icon: 'Sprout' },
    { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    { name: 'Expenses', href: '/expenses', icon: 'DollarSign' },
    { name: 'Weather', href: '/weather', icon: 'Cloud' }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Sprout" className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 font-display">FarmKeeper</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-r-2 border-primary'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                >
                  <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-warning rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Farm Manager</p>
                <p className="text-xs text-gray-500">Offline Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;