import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { cropService } from '@/services/api/cropService';
import { farmService } from '@/services/api/farmService';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmId: '',
    name: '',
    variety: '',
    plantingDate: '',
    expectedHarvest: '',
    status: 'seeded',
    area: ''
  });

  const cropStatuses = [
    { value: 'seeded', label: 'Seeded', color: 'info' },
    { value: 'growing', label: 'Growing', color: 'secondary' },
    { value: 'ready', label: 'Ready', color: 'warning' },
    { value: 'harvested', label: 'Harvested', color: 'success' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      
      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load crops data');
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
    
    if (!formData.farmId || !formData.name || !formData.plantingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newCrop = await cropService.create({
        ...formData,
        area: formData.area ? parseFloat(formData.area) : 0
      });
      
      setCrops(prev => [...prev, newCrop]);
      setFormData({
        farmId: '',
        name: '',
        variety: '',
        plantingDate: '',
        expectedHarvest: '',
        status: 'seeded',
        area: ''
      });
      setShowForm(false);
      toast.success('Crop added successfully!');
    } catch (err) {
      toast.error('Failed to add crop');
    }
  };

  const handleStatusUpdate = async (cropId, newStatus) => {
    try {
      const updatedCrop = await cropService.update(cropId, { status: newStatus });
      setCrops(prev => prev.map(crop => 
        crop.Id === cropId ? updatedCrop : crop
      ));
      toast.success('Crop status updated!');
    } catch (err) {
      toast.error('Failed to update crop status');
    }
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;

    try {
      await cropService.delete(cropId);
      setCrops(prev => prev.filter(crop => crop.Id !== cropId));
      toast.success('Crop deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete crop');
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getDaysToHarvest = (expectedHarvest) => {
    if (!expectedHarvest) return null;
    const days = differenceInDays(new Date(expectedHarvest), new Date());
    return days;
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getFarmName(crop.farmId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || crop.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading type="table" rows={5} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Crops</h1>
          <p className="text-gray-600 mt-1">Track your planted crops and their progress</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="mt-4 sm:mt-0"
        >
          Add Crop
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crops, varieties, or farms..."
          className="flex-1"
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Status</option>
          {cropStatuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add Crop Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Crop</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                Crop Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Corn, Tomatoes"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variety
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => handleInputChange('variety', e.target.value)}
                placeholder="e.g., Sweet Corn, Cherry Tomatoes"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planting Date *
              </label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Harvest
              </label>
              <input
                type="date"
                value={formData.expectedHarvest}
                onChange={(e) => handleInputChange('expectedHarvest', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (acres)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="lg:col-span-3 flex space-x-3 pt-4">
              <Button type="submit">Add Crop</Button>
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

      {/* Crops List */}
      {filteredCrops.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Crop</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Farm</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Planted</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Harvest</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Area</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCrops.map((crop) => {
                  const statusConfig = cropStatuses.find(s => s.value === crop.status);
                  const daysToHarvest = getDaysToHarvest(crop.expectedHarvest);
                  
                  return (
                    <tr key={crop.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                            <ApperIcon name="Sprout" className="w-5 h-5 text-secondary" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{crop.name}</p>
                            {crop.variety && (
                              <p className="text-sm text-gray-500">{crop.variety}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getFarmName(crop.farmId)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={statusConfig?.color} size="sm">
                            {statusConfig?.label}
                          </Badge>
                          {crop.status !== 'harvested' && (
                            <select
                              value={crop.status}
                              onChange={(e) => handleStatusUpdate(crop.Id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1"
                            >
                              {cropStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(crop.plantingDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {crop.expectedHarvest ? (
                          <div>
                            <p>{format(new Date(crop.expectedHarvest), 'MMM d, yyyy')}</p>
                            {daysToHarvest !== null && (
                              <p className={`text-xs ${
                                daysToHarvest < 0 ? 'text-error' : 
                                daysToHarvest <= 7 ? 'text-warning' : 
                                'text-gray-500'
                              }`}>
                                {daysToHarvest < 0 ? `${Math.abs(daysToHarvest)} days overdue` :
                                 daysToHarvest === 0 ? 'Today' :
                                 `${daysToHarvest} days to go`}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {crop.area ? `${crop.area} acres` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(crop.Id)}
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
          icon="Sprout"
          title="No crops found"
          message={searchTerm || filterStatus !== 'all' ? 
            "No crops match your current filters. Try adjusting your search or filter criteria." :
            "Start by adding your first crop to begin tracking your farming progress."
          }
          actionLabel="Add Crop"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
};

export default Crops;