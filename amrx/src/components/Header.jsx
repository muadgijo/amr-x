import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 backdrop-blur-sm group"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="text-xl group-hover:rotate-180 transition-transform duration-500">
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  );
};

export const Header = ({ activeTab, setActiveTab, userType = 'public' }) => {
  // Theme context available for future use
  const { theme: _theme } = useTheme();
  
  const navigationTabs = [
    { id: 'public', label: 'Public Form', icon: '👥' },
    { id: 'pharmacist', label: 'Pharmacist Upload', icon: '💊' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white shadow-2xl relative z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Enhanced Logo Section */}
          <div 
            className="flex items-center space-x-3 group cursor-pointer" 
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
            aria-label="Reload application"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-all duration-300 group-hover:scale-110">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">🦠</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                AMR-X
              </h1>
              <p className="text-xs text-blue-100 font-medium tracking-wider">ANTIMICROBIAL RESISTANCE TRACKER</p>
            </div>
          </div>

          {/* Enhanced Navigation - Only show for pharmacists */}
          {userType === 'pharmacist' && (
            <nav className="flex items-center space-x-2" role="navigation" aria-label="Main navigation">
              {navigationTabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-white text-emerald-700 shadow-lg transform scale-105' 
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Enhanced Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}; 