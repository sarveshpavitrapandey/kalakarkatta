import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode ? savedMode === 'dark' : true; // Default to dark
  });
  
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('theme-accent') || '#7c5cff'; // Default purple
  });

  useEffect(() => {
    // Apply dark/light mode class
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');

    // Apply accent color variable
    document.documentElement.style.setProperty('--color-primary', accentColor);
    document.documentElement.style.setProperty('--main-accent', accentColor);
    localStorage.setItem('theme-accent', accentColor);
  }, [isDarkMode, accentColor]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
