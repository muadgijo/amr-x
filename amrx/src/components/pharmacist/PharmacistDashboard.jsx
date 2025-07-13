import React, { useState, useEffect } from 'react';
import { StatCard } from '../StatCard';
import { PharmacistUpload } from '../PharmacistUpload';
import { useAuth } from '../auth/AuthProvider';
import ApiService from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export const PharmacistDashboard = ({ onLogout }) => {
  const { user: pharmacist, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    // Only load data if user is authenticated
    if (pharmacist) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [pharmacist]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if we have a token before making requests
      const token = localStorage.getItem('pharmacistToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const [statsData, submissionsData] = await Promise.all([
        ApiService.getPharmacistDashboard(),
        ApiService.getDashboardStats()
      ]);
      
      setStats(statsData);
      setRecentSubmissions(submissionsData.recent_submissions || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // If authentication fails, redirect to login
      if (error.message.includes('Authentication required') || error.message.includes('401')) {
        logout();
        if (onLogout) onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!pharmacist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-red-600 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-white mb-6">Please log in to access the dashboard.</p>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Use stats?.monthly_trends, stats?.region_counts, stats?.submissions
  // Prepare region marker coordinates (dummy for now, real mapping would use a geocoding service)
  const regionCoords = {
    'London': [51.505, -0.09],
    'New York': [40.7128, -74.006],
    'Delhi': [28.6139, 77.209],
    'Unknown': [20, 0]
  };

  // Add a function to refresh dashboard data
  const refreshDashboard = () => {
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AMR-X Professional Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {pharmacist?.name || 'Healthcare Professional'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pharmacist?.email || 'professional@amrx.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2" role="img" aria-label={tab.label}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Submissions"
                value={stats?.total_submissions || 0}
                icon="📋"
                color="blue"
                trend="+12%"
                trendUp={true}
              />
              <StatCard
                title="This Month"
                value={stats?.monthly_submissions || 0}
                icon="📅"
                color="emerald"
                trend="+8%"
                trendUp={true}
              />
              <StatCard
                title="Resistance Cases"
                value={stats?.resistance_cases || 0}
                icon="⚠️"
                color="red"
                trend="+5%"
                trendUp={false}
              />
              <StatCard
                title="Success Rate"
                value={`${stats?.success_rate || 0}%`}
                icon="✅"
                color="purple"
                trend="+2%"
                trendUp={true}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Submissions
              </h2>
              <div className="space-y-4">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {submission.id || '#'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {submission.medication_name || 'Unknown Medication'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {submission.timestamp || 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {submission.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent submissions found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Upload Prescription Data
            </h2>
            <PharmacistUpload refreshDashboard={refreshDashboard} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bar Chart: Submissions Over Time */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Submissions Over Time</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.monthly_trends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#6366f1" name="Submissions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Line Chart: Resistance Trend (mocked for now) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resistance Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.monthly_trends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#ef4444" name="Resistance Cases" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Heat Map: Region Counts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Geographic Distribution (Heat Map)</h2>
              <div className="h-96 w-full rounded-lg overflow-hidden">
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                  />
                  {/* Place a marker for each region with known coordinates */}
                  {stats?.region_counts && Object.entries(stats.region_counts).map(([region, count], idx) =>
                    regionCoords[region] ? (
                      <Marker key={region} position={regionCoords[region]}>
                        <Popup>{region}: {count} submissions</Popup>
                      </Marker>
                    ) : null
                  )}
                </MapContainer>
              </div>
            </div>
            {/* Data Table: All Submissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">All Pharmacist Submissions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Region</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medicine</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats?.submissions && stats.submissions.length > 0 ? (
                      stats.submissions.map((s, idx) => (
                        <tr key={s.id || idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.timestamp ? new Date(s.timestamp).toLocaleDateString() : ''}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.region || s.location || 'Unknown'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.medicineName || s.medicine || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.quantity || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-center text-gray-400 dark:text-gray-500">No submissions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {pharmacist?.name || 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {pharmacist?.email || 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Institution
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {pharmacist?.institution || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}; 