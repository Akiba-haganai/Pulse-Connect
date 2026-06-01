import { Outlet, Link } from 'react-router-dom';
import { Home, BookOpen, User, Megaphone, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [isDark, setIsDark] = useState(() => 
    localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 md:pt-16">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-indigo-600">CampusApp</h1>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Renders your child routes (Home, Study, etc.) */}
      <main className="max-w-4xl mx-auto p-4">
        <Outlet /> 
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex justify-around items-center h-16 text-gray-500 dark:text-gray-400">
          <Link to="/" className="p-2 flex flex-col items-center"><Home size={20} /><span className="text-[10px]">Home</span></Link>
          <Link to="/study" className="p-2 flex flex-col items-center"><BookOpen size={20} /><span className="text-[10px]">Study</span></Link>
          <Link to="/announcements" className="p-2 flex flex-col items-center"><Megaphone size={20} /><span className="text-[10px]">News</span></Link>
          <Link to="/profile" className="p-2 flex flex-col items-center"><User size={20} /><span className="text-[10px]">Profile</span></Link>
        </div>
      </nav>
    </div>
  );
}