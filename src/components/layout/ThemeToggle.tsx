import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // safe hydration init
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const initialDark = stored
      ? stored === 'dark'
      : prefersDark;

    setIsDark(initialDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <div className="p-2 rounded-xl opacity-50">
        <Moon size={20} />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="p-2 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}