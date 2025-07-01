import React, { useState, useEffect } from 'react';
import StatCard from '@/components/molecules/StatCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { farmService } from '@/services/api/farmService';
import { cropService } from '@/services/api/cropService';
import { taskService } from '@/services/api/taskService';
import { expenseService } from '@/services/api/expenseService';
import { format, isToday, addDays } from 'date-fns';

const Dashboard = () => {
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [farms, crops, tasks, expenses] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        expenseService.getAll()
      ]);
      
      setData({ farms, crops, tasks, expenses });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const activeCrops = data.crops.filter(crop => crop.status === 'growing').length;
  const todayTasks = data.tasks.filter(task => isToday(new Date(task.dueDate)) && !task.completed);
  const overdueTasks = data.tasks.filter(task => 
    new Date(task.dueDate) < new Date() && !task.completed
  );
  const thisMonthExpenses = data.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  }).reduce((total, expense) => total + expense.amount, 0);

  const upcomingTasks = data.tasks
    .filter(task => !task.completed && new Date(task.dueDate) <= addDays(new Date(), 7))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentExpenses = data.expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farms"
          value={data.farms.length}
          icon="MapPin"
          color="primary"
        />
        <StatCard
          title="Active Crops"
          value={activeCrops}
          icon="Sprout"
          color="secondary"
        />
        <StatCard
          title="Tasks Today"
          value={todayTasks.length}
          icon="CheckSquare"
          color="accent"
          trend={overdueTasks.length > 0 ? 'down' : 'up'}
          trendValue={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'On track'}
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${thisMonthExpenses.toLocaleString()}`}
          icon="DollarSign"
          color="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <ApperIcon name="Calendar" className="w-5 h-5 text-gray-500" />
          </div>
          
          {upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {upcomingTasks.map((task) => {
                const farm = data.farms.find(f => f.Id === task.farmId);
                const isOverdue = new Date(task.dueDate) < new Date();
                const taskIsToday = isToday(new Date(task.dueDate));
                
                return (
                  <div key={task.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      isOverdue ? 'bg-error' : taskIsToday ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        {farm?.name} • {format(new Date(task.dueDate), 'MMM d')}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      isOverdue ? 'bg-error/10 text-error' : 
                      taskIsToday ? 'bg-warning/10 text-warning' : 
                      'bg-success/10 text-success'
                    }`}>
                      {isOverdue ? 'Overdue' : taskIsToday ? 'Today' : 'Upcoming'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="CheckSquare" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming tasks</p>
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <ApperIcon name="Receipt" className="w-5 h-5 text-gray-500" />
          </div>
          
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => {
                const farm = data.farms.find(f => f.Id === expense.farmId);
                
                return (
                  <div key={expense.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-warning/20 rounded-lg flex items-center justify-center">
                        <ApperIcon name="DollarSign" className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {farm?.name} • {format(new Date(expense.date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${expense.amount}</p>
                      <p className="text-xs text-gray-500 capitalize">{expense.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="Receipt" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent expenses</p>
            </div>
          )}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Weather</h2>
          <ApperIcon name="Cloud" className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Thermometer" className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">72°F</p>
              <p className="text-sm text-gray-600">Temperature</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ApperIcon name="Droplets" className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">65%</p>
              <p className="text-sm text-gray-600">Humidity</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ApperIcon name="Wind" className="w-8 h-8 text-gray-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">8 mph</p>
              <p className="text-sm text-gray-600">Wind Speed</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <ApperIcon name="Info" className="w-4 h-4 inline mr-1" />
            Perfect conditions for watering outdoor crops. Consider morning irrigation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;