import React from 'react';

const Loading = ({ className = "", rows = 3, type = "card" }) => {
  const getSkeletonByType = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className={`space-y-6 ${className}`}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="w-16 h-4 bg-gray-200 rounded shimmer-effect mb-2"></div>
                      <div className="w-20 h-8 bg-gray-200 rounded shimmer-effect"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer-effect"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="w-32 h-6 bg-gray-200 rounded shimmer-effect mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full shimmer-effect"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-gray-200 rounded shimmer-effect mb-1"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded shimmer-effect"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            <div className="p-6 border-b border-gray-200">
              <div className="w-32 h-6 bg-gray-200 rounded shimmer-effect"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(rows)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer-effect"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-gray-200 rounded shimmer-effect mb-2"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded shimmer-effect"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded shimmer-effect"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'grid':
        return (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-full h-32 bg-gray-200 rounded-lg shimmer-effect mb-4"></div>
                <div className="w-3/4 h-5 bg-gray-200 rounded shimmer-effect mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded shimmer-effect mb-3"></div>
                <div className="w-full h-10 bg-gray-200 rounded shimmer-effect"></div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
            <div className="space-y-4">
              {[...Array(rows)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded shimmer-effect"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded shimmer-effect"></div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return getSkeletonByType();
};

export default Loading;