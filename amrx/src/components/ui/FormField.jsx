import React from 'react';

export const FormField = ({ 
  label, 
  icon, 
  children, 
  error, 
  required = false,
  className = "" 
}) => {
  return (
    <div className={className}>
      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-3 flex items-center">
        {icon && <span className="mr-2" role="img" aria-label={label}>{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center">
          <span className="mr-1" role="img" aria-label="Warning">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export const Input = ({ 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  error, 
  className = "",
  ...props 
}) => {
  const baseClasses = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const errorClasses = error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';
  
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
};

export const TextArea = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  error, 
  rows = 4,
  className = "",
  ...props 
}) => {
  const baseClasses = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const errorClasses = error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';
  
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
};

export const Select = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options, 
  error, 
  className = "",
  ...props 
}) => {
  const baseClasses = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
  const errorClasses = error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600';
  
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const Button = ({ 
  children, 
  type = "button", 
  loading = false, 
  disabled = false,
  variant = "primary",
  className = "",
  ...props 
}) => {
  const baseClasses = "px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white",
    secondary: "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}; 