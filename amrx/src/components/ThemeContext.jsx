import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Export the context for use in hooks
export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('amrx-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Apply theme to document for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    // Debug log
    console.log('Theme set:', theme, 'HTML classes:', document.documentElement.className);
    // Save to localStorage
    localStorage.setItem('amrx-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 