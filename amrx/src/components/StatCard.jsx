import React from 'react';

export const StatCard = ({ title, value, icon, color, description, isSelected, onClick }) => {
  const bgColorClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  }[color] || 'bg-gray-500';

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
        isSelected ? 'ring-2 ring-emerald-500 scale-105' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-xl ${bgColorClass} text-white mr-4 shadow-lg`}>
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
        </div>
        <div>
          <h3 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 