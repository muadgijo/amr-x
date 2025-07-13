import React, { useState, useEffect, useCallback } from 'react';
import { StatCard } from './StatCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (_err) {
      // Log error for debugging (in production, use proper logging service)
      setError('Failed to fetch dashboard data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRetry = () => {
    fetchStats();
  };

  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-400 font-semibold mb-2">Dashboard Error</p>
          <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          <button 
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            aria-label="Retry loading dashboard"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Entries", 
      value: stats.totalEntries || 0, 
      icon: "📊", 
      color: "emerald", 
      description: "Total submissions" 
    },
    { 
      title: "Top High-Risk Zone", 
      value: stats.highRiskZones?.[0] || 'No data', 
      icon: "🗺️", 
      color: "red", 
      description: "Most affected area" 
    },
    { 
      title: "Most Misused Antibiotic", 
      value: stats.commonAntibiotics?.[0] || 'No data', 
      icon: "💊", 
      color: "blue", 
      description: "Frequently prescribed" 
    },
    { 
      title: "Second Most Misused", 
      value: stats.commonAntibiotics?.[1] || 'No data', 
      icon: "💊", 
      color: "purple", 
      description: "Second most common" 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with refresh info */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Enhanced Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard 
            key={index}
            {...card}
            isSelected={selectedCard === index}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>

      {/* Enhanced Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img 
            src="https://placehold.co/800x400?text=Heatmap+Placeholder" 
            alt="Heatmap of antibiotic resistance risk" 
            className="rounded-xl w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img 
            src="https://placehold.co/600x400?text=Bar+Chart+Placeholder" 
            alt="Misused antibiotics bar chart" 
            className="rounded-xl w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center group hover:shadow-2xl transition-all duration-300">
          <img 
            src="https://placehold.co/600x400?text=Trend+Chart+Placeholder" 
            alt="Resistance trend over time" 
            className="rounded-xl w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>

      {/* Recent Submissions */}
      {stats.recentSubmissions && stats.recentSubmissions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Submissions</h2>
          <div className="space-y-3">
            {stats.recentSubmissions.slice(0, 5).map((submission, index) => (
              <div 
                key={submission.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {submission.type === 'public' ? '👥' : '💊'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {submission.type === 'public' 
                        ? submission.symptoms?.substring(0, 50) + '...'
                        : submission.medicineName
                      }
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {submission.location || submission.region}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {submission.timestamp ? new Date(submission.timestamp).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 