import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { farmService } from '@/services/api/farmService';
import { cropService } from '@/services/api/cropService';
import { toast } from 'react-toastify';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'acres'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load farms data');
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
    
    if (!formData.name || !formData.location || !formData.size) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newFarm = await farmService.create({
        ...formData,
        size: parseFloat(formData.size),
        createdAt: new Date().toISOString()
      });
      
      setFarms(prev => [...prev, newFarm]);
      setFormData({ name: '', location: '', size: '', sizeUnit: 'acres' });
      setShowForm(false);
      toast.success('Farm added successfully!');
    } catch (err) {
      toast.error('Failed to add farm');
    }
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;

    try {
      await farmService.delete(farmId);
      setFarms(prev => prev.filter(farm => farm.Id !== farmId));
      toast.success('Farm deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete farm');
    }
  };

  const getFarmCropCount = (farmId) => {
    return crops.filter(crop => crop.farmId === farmId).length;
  };

  const getActiveCropCount = (farmId) => {
    return crops.filter(crop => crop.farmId === farmId && crop.status === 'growing').length;
  };

  if (loading) return <Loading type="grid" rows={6} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Farms</h1>
          <p className="text-gray-600 mt-1">Manage your farm locations and properties</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="mt-4 sm:mt-0"
        >
          Add Farm
        </Button>
      </div>

      {/* Add Farm Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Farm</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter farm name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size *
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="Enter size"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.sizeUnit}
                onChange={(e) => handleInputChange('sizeUnit', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sq_ft">Square Feet</option>
                <option value="sq_m">Square Meters</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex space-x-3 pt-4">
              <Button type="submit">Add Farm</Button>
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

      {/* Farms Grid */}
      {farms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div key={farm.Id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <ApperIcon name="MapPin" className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-500">{farm.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(farm.Id)}
                  className="p-1 text-gray-400 hover:text-error rounded-lg transition-colors duration-200"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="font-medium text-gray-900">
                    {farm.size} {farm.sizeUnit}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Crops:</span>
                  <span className="font-medium text-gray-900">
                    {getFarmCropCount(farm.Id)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Crops:</span>
                  <span className="font-medium text-secondary">
                    {getActiveCropCount(farm.Id)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  icon="Eye"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon="MapPin"
          title="No farms yet"
          message="Start by adding your first farm to begin tracking your agricultural operations."
          actionLabel="Add Farm"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
};

export default Farms;