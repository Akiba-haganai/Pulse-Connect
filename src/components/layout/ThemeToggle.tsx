import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 transition-all active:scale-95 shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun size={15} className="text-amber-400 animate-pulse" />
      ) : (
        <Moon size={15} className="text-indigo-600" />
      )}
    </button>
  );
}