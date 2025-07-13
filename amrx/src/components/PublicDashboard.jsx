import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

export const PublicDashboard = ({ onBackToHome, onSubmitAgain }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch public stats from backend
    const fetchStats = async () => {
      try {
        const data = await ApiService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const misuseData = [
    {
      title: "Incomplete Course",
      percentage: 45,
      description: "Stopping antibiotics early can lead to resistance",
      icon: "⏰",
      color: "red"
    },
    {
      title: "Self-Medication",
      percentage: 32,
      description: "Using antibiotics without prescription",
      icon: "💊",
      color: "orange"
    },
    {
      title: "Wrong Dosage",
      percentage: 18,
      description: "Taking incorrect amounts or timing",
      icon: "📏",
      color: "yellow"
    },
    {
      title: "Sharing Medications",
      percentage: 5,
      description: "Using someone else's antibiotics",
      icon: "🤝",
      color: "purple"
    }
  ];

  const preventionTips = [
    {
      title: "Complete Your Course",
      description: "Always finish the full prescription, even if you feel better",
      icon: "✅"
    },
    {
      title: "Follow Instructions",
      description: "Take antibiotics exactly as prescribed by your doctor",
      icon: "📋"
    },
    {
      title: "Don't Share",
      description: "Never share antibiotics with others or use leftover medications",
      icon: "🚫"
    },
    {
      title: "Ask Questions",
      description: "Discuss with your healthcare provider about proper antibiotic use",
      icon: "❓"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">
            🎉 Thank you for contributing!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200">
            Your data helps us track and fight Antimicrobial Resistance (AMR) worldwide.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'misuse', label: 'Misuse Data', icon: '⚠️' },
                { id: 'recent', label: 'Recent Submissions', icon: '📝' },
                { id: 'zones', label: 'High-Risk Zones', icon: '🌍' },
                { id: 'antibiotics', label: 'Common Antibiotics', icon: '💊' },
                { id: 'prevention', label: 'Prevention', icon: '🛡️' },
                { id: 'facts', label: 'AMR Facts', icon: '📚' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-emerald-700 dark:text-emerald-400">
                📊 Global AMR Statistics
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                      {stats.total_submissions?.toLocaleString() || '0'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">Total Submissions</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                      {stats.resistance_cases?.toLocaleString() || '0'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">Resistance Cases</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                      {stats.misuse_percentage || '0'}%
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">Misuse Rate</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                      {stats.countries_affected || '0'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">Countries Affected</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">
                  Could not load statistics. Please try again later.
                </div>
              )}

              <div className="text-center">
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                  Your contribution helps researchers understand patterns and develop better strategies to combat AMR.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'misuse' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-red-600 dark:text-red-400">
                ⚠️ Common Antibiotic Misuse Patterns
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {misuseData.map((item, index) => (
                  <div key={index} className={`bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-${item.color}-800 dark:to-${item.color}-900 rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{item.icon}</div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {item.percentage}%
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
                  🚨 Why This Matters
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Antibiotic misuse accelerates the development of resistant bacteria, making infections harder to treat. 
                  By understanding these patterns, we can develop better education and prevention strategies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'prevention' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-green-600 dark:text-green-400">
                🛡️ How to Prevent AMR
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {preventionTips.map((tip, index) => (
                  <div key={index} className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{tip.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                          {tip.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                  💡 Additional Tips
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                  <li>• Wash your hands regularly to prevent infections</li>
                  <li>• Get vaccinated to reduce the need for antibiotics</li>
                  <li>• Only use antibiotics when prescribed by a healthcare professional</li>
                  <li>• Support research and development of new antibiotics</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'facts' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-purple-600 dark:text-purple-400">
                📚 AMR Facts & Figures
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-purple-800 dark:text-purple-200">
                    🌍 Global Impact
                  </h3>
                  <ul className="text-purple-700 dark:text-purple-300 space-y-2">
                    <li>• AMR could cause 10 million deaths annually by 2050</li>
                    <li>• Currently responsible for 700,000+ deaths per year</li>
                    <li>• Could cost the global economy $100 trillion by 2050</li>
                    <li>• Affects all countries, regardless of income level</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">
                    ⚡ Current Challenges
                  </h3>
                  <ul className="text-red-700 dark:text-red-300 space-y-2">
                    <li>• Few new antibiotics in development pipeline</li>
                    <li>• Resistance developing faster than new treatments</li>
                    <li>• Limited global surveillance and reporting</li>
                    <li>• Inadequate public awareness and education</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">
                    🌟 What You Can Do
                  </h3>
                  <ul className="text-green-700 dark:text-green-300 space-y-2">
                    <li>• Report your antibiotic use patterns (like you just did!)</li>
                    <li>• Educate friends and family about proper antibiotic use</li>
                    <li>• Support organizations working on AMR solutions</li>
                    <li>• Stay informed about the latest AMR research</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">
                📝 Recent Public Submissions
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading submissions...</p>
                </div>
              ) : stats && stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Symptoms</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Medication</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.recentSubmissions.filter(s => s.type === 'public').map((sub, idx) => (
                        <tr key={sub.id || idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{sub.timestamp ? new Date(sub.timestamp).toLocaleString() : '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{sub.symptoms || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{sub.medication || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{sub.location || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">
                  No recent public submissions found.
                </div>
              )}
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-emerald-700 dark:text-emerald-400">
                🌍 High-Risk Zones
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading zones...</p>
                </div>
              ) : stats && stats.highRiskZones && stats.highRiskZones.length > 0 ? (
                <ul className="list-disc list-inside text-lg text-gray-700 dark:text-gray-200 space-y-2">
                  {stats.highRiskZones.map((zone, idx) => (
                    <li key={idx}>{zone}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-red-500">
                  No high-risk zones found.
                </div>
              )}
            </div>
          )}

          {activeTab === 'antibiotics' && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">
                💊 Common Antibiotics
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading antibiotics...</p>
                </div>
              ) : stats && stats.commonAntibiotics && stats.commonAntibiotics.length > 0 ? (
                <ul className="list-disc list-inside text-lg text-gray-700 dark:text-gray-200 space-y-2">
                  {stats.commonAntibiotics.map((ab, idx) => (
                    <li key={idx}>{ab}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-red-500">
                  No common antibiotics found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            onClick={onSubmitAgain}
            className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            📤 Submit Another Report
          </button>
          <button
            onClick={onBackToHome}
            className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full font-bold shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
          >
            🏠 Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}; 