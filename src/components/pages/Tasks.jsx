import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services/api/taskService';
import { farmService } from '@/services/api/farmService';
import { cropService } from '@/services/api/cropService';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import { toast } from 'react-toastify';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    title: '',
    type: 'watering',
    dueDate: '',
    notes: ''
  });

  const taskTypes = [
    { value: 'watering', label: 'Watering', icon: 'Droplets' },
    { value: 'fertilizing', label: 'Fertilizing', icon: 'Leaf' },
    { value: 'harvesting', label: 'Harvesting', icon: 'Scissors' },
    { value: 'planting', label: 'Planting', icon: 'Sprout' },
    { value: 'weeding', label: 'Weeding', icon: 'Trash2' },
    { value: 'inspection', label: 'Inspection', icon: 'Eye' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load tasks data');
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
    
    if (!formData.farmId || !formData.title || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newTask = await taskService.create({
        ...formData,
        completed: false
      });
      
      setTasks(prev => [...prev, newTask]);
      setFormData({
        farmId: '',
        cropId: '',
        title: '',
        type: 'watering',
        dueDate: '',
        notes: ''
      });
      setShowForm(false);
      toast.success('Task added successfully!');
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const updatedTask = await taskService.update(taskId, { completed: !completed });
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
      toast.success(completed ? 'Task marked incomplete' : 'Task completed!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCropName = (cropId) => {
    if (!cropId) return null;
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.name : 'Unknown Crop';
  };

  const getTaskTypeIcon = (type) => {
    const taskType = taskTypes.find(t => t.value === type);
    return taskType ? taskType.icon : 'MoreHorizontal';
  };

  const getTaskStatus = (task) => {
    if (task.completed) return { label: 'Completed', color: 'success' };
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { label: 'Overdue', color: 'error' };
    } else if (isToday(dueDate)) {
      return { label: 'Due Today', color: 'warning' };
    } else if (isThisWeek(dueDate)) {
      return { label: 'This Week', color: 'info' };
    } else {
      return { label: 'Upcoming', color: 'default' };
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getFarmName(task.farmId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus === 'completed') {
      matchesStatus = task.completed;
    } else if (filterStatus === 'pending') {
      matchesStatus = !task.completed;
    } else if (filterStatus === 'overdue') {
      matchesStatus = !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
    } else if (filterStatus === 'today') {
      matchesStatus = !task.completed && isToday(new Date(task.dueDate));
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by completion status first, then by due date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const getCropOptions = () => {
    if (!formData.farmId) return [];
    return crops.filter(crop => crop.farmId === formData.farmId);
  };

  if (loading) return <Loading type="table" rows={6} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your farming activities and schedule</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="mt-4 sm:mt-0"
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks, farms, or notes..."
          className="flex-1"
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
        </select>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h2>
          
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
                Crop (Optional)
              </label>
              <select
                value={formData.cropId}
                onChange={(e) => handleInputChange('cropId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={!formData.farmId}
              >
                <option value="">Select a crop (optional)</option>
                {getCropOptions().map(crop => (
                  <option key={crop.Id} value={crop.Id}>{crop.name} - {crop.variety}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Water tomato plants"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {taskTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="md:col-span-2 flex space-x-3 pt-4">
              <Button type="submit">Add Task</Button>
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

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const status = getTaskStatus(task);
            const cropName = getCropName(task.cropId);
            
            return (
              <div 
                key={task.Id} 
                className={`bg-white p-6 rounded-lg border-l-4 border border-gray-200 hover:shadow-lg transition-all duration-200 ${
                  task.completed ? 'border-l-success bg-success/5' :
                  status.color === 'error' ? 'border-l-error' :
                  status.color === 'warning' ? 'border-l-warning' :
                  'border-l-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task.Id, task.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed 
                          ? 'bg-success border-success text-white' 
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {task.completed && <ApperIcon name="Check" className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-warning/20 rounded-lg flex items-center justify-center">
                          <ApperIcon name={getTaskTypeIcon(task.type)} className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className={`text-lg font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <Badge variant={status.color} size="sm">
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <ApperIcon name="MapPin" className="w-4 h-4 mr-1" />
                          {getFarmName(task.farmId)}
                        </div>
                        {cropName && (
                          <div className="flex items-center">
                            <ApperIcon name="Sprout" className="w-4 h-4 mr-1" />
                            {cropName}
                          </div>
                        )}
                        <div className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      {task.notes && (
                        <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(task.Id)}
                    className="p-2 text-gray-400 hover:text-error rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          message={searchTerm || filterStatus !== 'all' ? 
            "No tasks match your current filters. Try adjusting your search or filter criteria." :
            "Start by adding your first task to organize your farming activities."
          }
          actionLabel="Add Task"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
};

export default Tasks;