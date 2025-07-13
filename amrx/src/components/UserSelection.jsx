import React from 'react';

export const UserSelection = ({ onSelectUserType }) => {
  const userTypes = [
    {
      id: 'public',
      title: 'Public User',
      description: 'Submit symptoms and medication usage anonymously',
      icon: '👥',
      color: 'emerald',
      features: [
        'Submit symptoms anonymously',
        'Report medication usage',
        'Help track resistance patterns',
        'No registration required'
      ]
    },
    {
      id: 'pharmacist',
      title: 'Healthcare Professional',
      description: 'Log prescriptions and access professional dashboard',
      icon: '💊',
      color: 'blue',
      features: [
        'Log prescription data',
        'Access professional dashboard',
        'View analytics and trends',
        'Secure login required'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to AMR-X</h1>
          <p className="text-xl text-white/90">Choose how you'd like to use the platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {userTypes.map((userType) => (
            <div
              key={userType.id}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              onClick={() => onSelectUserType(userType.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectUserType(userType.id)}
              aria-label={`Select ${userType.title}`}
            >
              <div className="text-center mb-6">
                <div className={`inline-block p-6 bg-gradient-to-r from-${userType.color}-500 to-${userType.color === 'emerald' ? 'blue' : 'purple'}-500 rounded-full mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  <span className="text-4xl" role="img" aria-label={userType.title}>
                    {userType.icon}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {userType.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {userType.description}
                </p>
              </div>

              <ul className="space-y-3">
                {userType.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-200">
                    <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">
                      ✓
                    </span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 text-center">
                <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-${userType.color}-600 to-${userType.color === 'emerald' ? 'blue' : 'purple'}-600 text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <span>Continue as {userType.title}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            Your data helps combat antimicrobial resistance worldwide
          </p>
        </div>
      </div>
    </div>
  );
}; 