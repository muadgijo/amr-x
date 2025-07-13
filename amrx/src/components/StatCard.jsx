import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

export const StatCard = memo(({ 
  title, 
  value, 
  icon, 
  color, 
  description, 
  isSelected, 
  onClick,
  className = "",
  loading = false,
  trend = null,
  trendValue = null
}) => {
  const bgColorClass = useMemo(() => {
    const colorMap = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      indigo: 'bg-indigo-500',
      pink: 'bg-pink-500'
    };
    return colorMap[color] || 'bg-gray-500';
  }, [color]);

  const handleClick = useCallback(() => {
    if (!loading && onClick) {
      onClick();
    }
  }, [onClick, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    const isPositive = trend === 'up';
    const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const trendIcon = isPositive ? '↗️' : '↘️';
    
    return (
      <div className={`flex items-center text-xs font-medium ${trendColor} mt-1`}>
        <span className="mr-1" role="img" aria-label={`Trend ${trend}`}>
          {trendIcon}
        </span>
        {trendValue}
      </div>
    );
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 
        transition-all duration-300 transform hover:scale-105 cursor-pointer
        ${isSelected ? 'ring-2 ring-emerald-500 scale-105' : ''}
        ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl'}
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${title}: ${value}${trend ? `, trend: ${trend}` : ''}`}
      aria-pressed={isSelected}
      aria-disabled={loading}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-xl ${bgColorClass} text-white mr-4 shadow-lg relative`}>
          {loading && (
            <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
          )}
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide truncate">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {loading ? '...' : value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {renderTrend()}
        </div>
        {isSelected && (
          <div className="ml-2 text-emerald-500">
            <span role="img" aria-label="Selected">✓</span>
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['emerald', 'blue', 'red', 'purple', 'yellow', 'orange', 'indigo', 'pink']),
  description: PropTypes.string,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  loading: PropTypes.bool,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string
};

StatCard.defaultProps = {
  color: 'emerald',
  isSelected: false,
  loading: false,
  className: ""
};

StatCard.displayName = 'StatCard'; 