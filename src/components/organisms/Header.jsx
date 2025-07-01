import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { notificationService } from '@/services/api/notificationService';
import { isToday, isTomorrow, addDays, isBefore } from 'date-fns';
import { toast } from 'react-toastify';

const Header = ({ onMenuToggle, title = "Dashboard" }) => {
  const [upcomingTaskCount, setUpcomingTaskCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    loadUpcomingTaskCount();
    const interval = setInterval(loadUpcomingTaskCount, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadUpcomingTaskCount = async () => {
    try {
      const upcomingTasks = await taskService.getUpcomingTasks();
      setUpcomingTaskCount(upcomingTasks.length);
      
      // Send push notifications for urgent tasks
      if (notificationPermission === 'granted') {
        upcomingTasks.forEach(task => {
          const dueDate = new Date(task.dueDate);
          if (isToday(dueDate) || isTomorrow(dueDate)) {
            notificationService.sendTaskReminder(task);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load upcoming tasks:', error);
    }
  };

  const handleNotificationClick = async () => {
    if (notificationPermission === 'default') {
      try {
        const permission = await notificationService.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          toast.success('Notifications enabled! You\'ll receive reminders for upcoming tasks.');
          loadUpcomingTaskCount(); // Trigger notifications for current tasks
        } else {
          toast.warning('Notifications disabled. Enable them in your browser settings to receive task reminders.');
        }
      } catch (error) {
        toast.error('Failed to enable notifications');
      }
    } else if (notificationPermission === 'granted') {
      toast.info(`You have ${upcomingTaskCount} upcoming tasks that need attention.`);
    } else {
      toast.warning('Notifications are blocked. Enable them in your browser settings to receive task reminders.');
    }
  };

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
            {/* Notification Bell with Task Count */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              title={`${upcomingTaskCount} upcoming tasks`}
            >
              <ApperIcon name="Bell" className="w-5 h-5" />
              {upcomingTaskCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1 animate-pulse">
                  {upcomingTaskCount > 99 ? '99+' : upcomingTaskCount}
                </span>
              )}
              {notificationPermission === 'default' && (
                <span className="absolute -top-1 -right-1 bg-warning w-3 h-3 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <ApperIcon name="Settings" className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mobile Notification Bell */}
          <div className="sm:hidden">
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
              title={`${upcomingTaskCount} upcoming tasks`}
            >
              <ApperIcon name="Bell" className="w-5 h-5" />
              {upcomingTaskCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1 animate-pulse">
                  {upcomingTaskCount > 99 ? '99+' : upcomingTaskCount}
                </span>
              )}
              {notificationPermission === 'default' && (
                <span className="absolute -top-1 -right-1 bg-warning w-3 h-3 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;