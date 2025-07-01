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
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFarm, setFilterFarm] = useState('all');
const [showForm, setShowForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowExportModal(true)}
            icon="Download"
            variant="outline"
          >
            Export
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            icon="Plus"
          >
            Add Expense
          </Button>
        </div>
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
{/* Export Modal */}
      {showExportModal && (
        <ExportModal
          expenses={filteredExpenses}
          farms={farms}
          onClose={() => setShowExportModal(false)}
          getCategoryConfig={getCategoryConfig}
          getFarmName={getFarmName}
        />
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

// Export Modal Component
const ExportModal = ({ expenses, farms, onClose, getCategoryConfig, getFarmName }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Filter expenses based on date range
  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    const now = new Date();

    switch (dateRange) {
      case 'thisMonth':
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfMonth(now) && expenseDate <= endOfMonth(now);
        });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfMonth(lastMonth) && expenseDate <= endOfMonth(lastMonth);
        });
        break;
      case 'thisYear':
        filtered = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          filtered = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= start && expenseDate <= end;
          });
        }
        break;
      default: // 'all'
        break;
    }

    return filtered;
  };

  // Prepare CSV data
  const prepareCSVData = () => {
    const filtered = getFilteredExpenses();
    return filtered.map(expense => ({
      'Date': format(new Date(expense.date), 'yyyy-MM-dd'),
      'Description': expense.description,
      'Farm': getFarmName(expense.farmId),
      'Category': getCategoryConfig(expense.category).label,
      'Amount': expense.amount
    }));
  };

  // Generate PDF
  const generatePDF = () => {
    const filtered = getFilteredExpenses();
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);
    
    // Date range info
    doc.setFontSize(12);
    let dateInfo = '';
    switch (dateRange) {
      case 'thisMonth':
        dateInfo = `This Month (${format(startOfMonth(new Date()), 'MMM yyyy')})`;
        break;
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1);
        dateInfo = `Last Month (${format(lastMonth, 'MMM yyyy')})`;
        break;
      case 'thisYear':
        dateInfo = `This Year (${new Date().getFullYear()})`;
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          dateInfo = `${format(new Date(customStartDate), 'MMM d, yyyy')} - ${format(new Date(customEndDate), 'MMM d, yyyy')}`;
        }
        break;
      default:
        dateInfo = 'All Time';
    }
    doc.text(`Period: ${dateInfo}`, 20, 30);
    
    // Summary
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    doc.text(`Total Expenses: $${total.toLocaleString()}`, 20, 40);
    doc.text(`Number of Entries: ${filtered.length}`, 20, 50);
    
    // Table data
    const tableData = filtered.map(expense => [
      format(new Date(expense.date), 'MMM d, yyyy'),
      expense.description,
      getFarmName(expense.farmId),
      getCategoryConfig(expense.category).label,
      `$${expense.amount.toLocaleString()}`
    ]);
    
    // Generate table
    doc.autoTable({
      head: [['Date', 'Description', 'Farm', 'Category', 'Amount']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        4: { halign: 'right' } // Right align amount column
      }
    });
    
    return doc;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filtered = getFilteredExpenses();
      
      if (filtered.length === 0) {
        toast.warning('No expenses found for the selected date range');
        setIsExporting(false);
        return;
      }

      if (exportFormat === 'pdf') {
        const doc = generatePDF();
        const fileName = `expenses-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        doc.save(fileName);
        toast.success('PDF report exported successfully!');
      } else {
        // CSV export will be handled by CSVLink component
        toast.success('CSV report exported successfully!');
      }
      
      // Small delay to show the export process
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
      setIsExporting(false);
    }
  };

  const csvData = prepareCSVData();
  const csvFilename = `expenses-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Expense Report</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ApperIcon name="FileText" className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">CSV</div>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  exportFormat === 'pdf'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ApperIcon name="FileDown" className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">PDF</div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <div>Expenses to export: <span className="font-medium text-gray-900">{getFilteredExpenses().length}</span></div>
              <div>Total amount: <span className="font-medium text-gray-900">${getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}</span></div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex space-x-3 pt-2">
            {exportFormat === 'csv' ? (
              <CSVLink
                data={csvData}
                filename={csvFilename}
                onClick={() => {
                  if (csvData.length === 0) {
                    toast.warning('No expenses found for the selected date range');
                    return false;
                  }
                  handleExport();
                  return true;
                }}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {isExporting ? (
                  <>
                    <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Download" className="w-4 h-4 mr-2" />
                    Export CSV
                  </>
                )}
              </CSVLink>
            ) : (
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1"
                icon={isExporting ? "Loader2" : "Download"}
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isExporting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;