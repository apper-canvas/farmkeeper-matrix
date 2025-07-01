import React, { useState, useEffect } from 'react';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { format, addDays } from 'date-fns';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock weather data - in a real app, this would come from a weather API
  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWeather = {
        current: {
          temperature: 72,
          humidity: 65,
          windSpeed: 8,
          pressure: 30.1,
          condition: 'partly-cloudy',
          conditionText: 'Partly Cloudy'
        },
        forecast: [
          { 
            date: new Date(), 
            high: 75, 
            low: 58, 
            condition: 'partly-cloudy', 
            precipitation: 10,
            humidity: 65,
            windSpeed: 8
          },
          { 
            date: addDays(new Date(), 1), 
            high: 78, 
            low: 61, 
            condition: 'sunny', 
            precipitation: 0,
            humidity: 55,
            windSpeed: 6
          },
          { 
            date: addDays(new Date(), 2), 
            high: 73, 
            low: 59, 
            condition: 'rainy', 
            precipitation: 80,
            humidity: 85,
            windSpeed: 12
          },
          { 
            date: addDays(new Date(), 3), 
            high: 69, 
            low: 55, 
            condition: 'cloudy', 
            precipitation: 30,
            humidity: 70,
            windSpeed: 10
          },
          { 
            date: addDays(new Date(), 4), 
            high: 76, 
            low: 62, 
            condition: 'sunny', 
            precipitation: 5,
            humidity: 60,
            windSpeed: 7
          }
        ]
      };
      
      setWeatherData(mockWeather);
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': 'Sun',
      'partly-cloudy': 'CloudSun',
      'cloudy': 'Cloud',
      'rainy': 'CloudRain',
      'stormy': 'CloudLightning',
      'snowy': 'CloudSnow'
    };
    return iconMap[condition] || 'Cloud';
  };

  const getWeatherAdvice = (forecast) => {
    const todayForecast = forecast[0];
    const tomorrowForecast = forecast[1];
    
    const advice = [];
    
    if (todayForecast.precipitation > 70) {
      advice.push({
        type: 'warning',
        icon: 'CloudRain',
        title: 'Heavy Rain Expected',
        message: 'Postpone watering activities. Ensure proper drainage for crops.'
      });
    } else if (todayForecast.precipitation < 20 && todayForecast.humidity < 60) {
      advice.push({
        type: 'info',
        icon: 'Droplets',
        title: 'Dry Conditions',
        message: 'Consider watering crops early morning or evening to reduce evaporation.'
      });
    }
    
    if (todayForecast.windSpeed > 15) {
      advice.push({
        type: 'warning',
        icon: 'Wind',
        title: 'High Winds',
        message: 'Secure loose equipment and check young plants for support needs.'
      });
    }
    
    if (tomorrowForecast.precipitation > 60 && todayForecast.precipitation < 30) {
      advice.push({
        type: 'success',
        icon: 'Calendar',
        title: 'Rain Tomorrow',
        message: 'Good day for harvesting or fieldwork before rain arrives.'
      });
    }
    
    if (advice.length === 0) {
      advice.push({
        type: 'success',
        icon: 'Sun',
        title: 'Good Conditions',
        message: 'Excellent weather for most farming activities.'
      });
    }
    
    return advice;
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadWeatherData} />;

  const advice = getWeatherAdvice(weatherData.forecast);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Weather</h1>
        <p className="text-gray-600 mt-1">5-day weather forecast with farming insights</p>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
            <p className="text-blue-100 mb-4">{format(new Date(), 'EEEE, MMMM d')}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ApperIcon 
                  name={getWeatherIcon(weatherData.current.condition)} 
                  className="w-16 h-16 mr-4" 
                />
                <div>
                  <div className="text-5xl font-bold">{weatherData.current.temperature}°F</div>
                  <div className="text-blue-100">{weatherData.current.conditionText}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <ApperIcon name="Droplets" className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{weatherData.current.humidity}%</div>
              <div className="text-sm text-blue-100">Humidity</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <ApperIcon name="Wind" className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{weatherData.current.windSpeed}</div>
              <div className="text-sm text-blue-100">mph</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <ApperIcon name="Gauge" className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{weatherData.current.pressure}</div>
              <div className="text-sm text-blue-100">inHg</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <ApperIcon name="Eye" className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">10</div>
              <div className="text-sm text-blue-100">mi</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">5-Day Forecast</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border text-center transition-all duration-200 hover:shadow-md ${
                index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900 mb-2">
                {index === 0 ? 'Today' : format(day.date, 'EEE')}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {format(day.date, 'MMM d')}
              </div>
              
              <div className="flex justify-center mb-3">
                <ApperIcon 
                  name={getWeatherIcon(day.condition)} 
                  className={`w-10 h-10 ${
                    day.condition === 'sunny' ? 'text-yellow-500' :
                    day.condition === 'rainy' ? 'text-blue-500' :
                    day.condition === 'partly-cloudy' ? 'text-gray-500' :
                    'text-gray-400'
                  }`}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">{day.high}°</span>
                  <span className="text-gray-500">{day.low}°</span>
                </div>
                
                <div className="flex items-center justify-center text-xs text-gray-600">
                  <ApperIcon name="CloudRain" className="w-3 h-3 mr-1" />
                  <span>{day.precipitation}%</span>
                </div>
                
                <div className="flex items-center justify-center text-xs text-gray-600">
                  <ApperIcon name="Wind" className="w-3 h-3 mr-1" />
                  <span>{day.windSpeed} mph</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming Advice */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Farming Insights</h2>
        
        <div className="space-y-4">
          {advice.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                item.type === 'warning' ? 'bg-warning/5 border-warning' :
                item.type === 'success' ? 'bg-success/5 border-success' :
                'bg-info/5 border-info'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.type === 'warning' ? 'bg-warning/20 text-warning' :
                  item.type === 'success' ? 'bg-success/20 text-success' :
                  'bg-info/20 text-info'
                }`}>
                  <ApperIcon name={item.icon} className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Weather Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Soil Conditions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Thermometer" className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-gray-700">Soil Temperature</span>
              </div>
              <span className="font-semibold text-gray-900">68°F</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Droplets" className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-700">Soil Moisture</span>
              </div>
              <span className="font-semibold text-gray-900">Good</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Sun" className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">UV Index</span>
              </div>
              <span className="font-semibold text-gray-900">6 (High)</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growing Conditions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Sunrise" className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">Sunrise</span>
              </div>
              <span className="font-semibold text-gray-900">6:45 AM</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Sunset" className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-gray-700">Sunset</span>
              </div>
              <span className="font-semibold text-gray-900">7:32 PM</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ApperIcon name="Clock" className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Daylight Hours</span>
              </div>
              <span className="font-semibold text-gray-900">12h 47m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;