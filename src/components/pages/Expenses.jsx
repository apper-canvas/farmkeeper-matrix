import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { expenseService } from '@/services/api/expenseService';
import { farmService } from '@/services/api/farmService';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'react-toastify';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFarm, setFilterFarm] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmId: '',
    category: 'seeds',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    { value: 'seeds', label: 'Seeds & Plants', icon: 'Sprout', color: 'secondary' },
    { value: 'equipment', label: 'Equipment', icon: 'Wrench', color: 'info' },
    { value: 'labor', label: 'Labor', icon: 'Users', color: 'warning' },
    { value: 'fertilizer', label: 'Fertilizer', icon: 'Leaf', color: 'success' },
    { value: 'fuel', label: 'Fuel', icon: 'Fuel', color: 'error' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Settings', color: 'accent' },
    { value: 'utilities', label: 'Utilities', icon: 'Zap', color: 'primary' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'default' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      
      setExpenses(expensesData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load expenses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newExpense = await expenseService.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      setExpenses(prev => [...prev, newExpense]);
      setFormData({
        farmId: '',
        category: 'seeds',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      toast.success('Expense added successfully!');
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseService.delete(expenseId);
      setExpenses(prev => prev.filter(expense => expense.Id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCategoryConfig = (category) => {
    return expenseCategories.find(cat => cat.value === category) || expenseCategories[0];
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getFarmName(expense.farmId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesFarm = filterFarm === 'all' || expense.farmId === filterFarm;
    return matchesSearch && matchesCategory && matchesFarm;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate >= startOfMonth(now) && expenseDate <= endOfMonth(now);
  }).reduce((total, expense) => total + expense.amount, 0);

  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const lastMonth = subMonths(new Date(), 1);
    return expenseDate >= startOfMonth(lastMonth) && expenseDate <= endOfMonth(lastMonth);
  }).reduce((total, expense) => total + expense.amount, 0);

  const monthlyChange = lastMonthExpenses > 0 ? 
    ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1) : 0;

  if (loading) return <Loading type="table" rows={5} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage your farm-related expenses</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="mt-4 sm:mt-0"
        >
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${thisMonthExpenses.toLocaleString()}</p>
              {monthlyChange !== 0 && (
                <div className="flex items-center mt-1">
                  <ApperIcon 
                    name={monthlyChange > 0 ? 'TrendingUp' : 'TrendingDown'} 
                    className={`w-4 h-4 mr-1 ${monthlyChange > 0 ? 'text-error' : 'text-success'}`}
                  />
                  <span className={`text-sm font-medium ${monthlyChange > 0 ? 'text-error' : 'text-success'}`}>
                    {Math.abs(monthlyChange)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-warning/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average per Entry</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(0) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-success/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search expenses or farms..."
          className="flex-1"
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
        
        <select
          value={filterFarm}
          onChange={(e) => setFilterFarm(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Farms</option>
          {farms.map(farm => (
            <option key={farm.Id} value={farm.Id}>{farm.name}</option>
          ))}
        </select>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Expense</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm *
              </label>
              <select
                value={formData.farmId}
                onChange={(e) => handleInputChange('farmId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Select a farm</option>
                {farms.map(farm => (
                  <option key={farm.Id} value={farm.Id}>{farm.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {expenseCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Corn seeds for north field"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div className="md:col-span-2 flex space-x-3 pt-4">
              <Button type="submit">Add Expense</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Farm</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const categoryConfig = getCategoryConfig(expense.category);
                  
                  return (
                    <tr key={expense.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 bg-gradient-to-br from-${categoryConfig.color}/20 to-${categoryConfig.color}/10 rounded-lg flex items-center justify-center`}>
                            <ApperIcon name={categoryConfig.icon} className={`w-5 h-5 text-${categoryConfig.color}`} />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{expense.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getFarmName(expense.farmId)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {categoryConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          ${expense.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(expense.Id)}
                          className="p-2 text-gray-400 hover:text-error rounded-lg transition-colors duration-200"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty
          icon="Receipt"
          title="No expenses found"
          message={searchTerm || filterCategory !== 'all' || filterFarm !== 'all' ? 
            "No expenses match your current filters. Try adjusting your search or filter criteria." :
            "Start by adding your first expense to track your farm-related costs."
          }
          actionLabel="Add Expense"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
};

export default Expenses;