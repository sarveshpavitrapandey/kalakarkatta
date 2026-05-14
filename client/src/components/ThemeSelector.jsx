import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { isDarkMode, toggleDarkMode, accentColor, setAccentColor } = useContext(ThemeContext);

  const colors = [
    { name: 'Purple', hex: '#7c5cff' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Orange', hex: '#f97316' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface rounded-xl border border-border">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">Theme Mode</span>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
        >
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Accent Color</span>
        <div className="flex gap-3">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => setAccentColor(color.hex)}
              className={`w-8 h-8 rounded-full shadow-lg transition-transform hover:scale-110 ${accentColor === color.hex ? 'ring-2 ring-white scale-110' : ''}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
