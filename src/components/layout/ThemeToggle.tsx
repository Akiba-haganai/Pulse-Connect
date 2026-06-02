import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('pulse_theme') === 'dark';
    }
    return true; // Default to dark mode for late-night campus utility
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pulse_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pulse_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 transition-all active:scale-95 shadow-sm"
      aria-label="Toggle High Contrast Night Mode"
    >
      {isDark ? (
        <Sun size={15} className="text-amber-400 animate-pulse" />
      ) : (
        <Moon size={15} className="text-indigo-600" />
      )}
    </button>
  );
}