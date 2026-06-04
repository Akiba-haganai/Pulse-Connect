import { Outlet, Link } from "react-router-dom";
import { Home, BookOpen, User, Megaphone, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

function getInitialTheme() {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem("theme");

  if (stored) return stored === "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Layout() {
  const [isDark, setIsDark] = useState(false);

  // init theme safely after mount
  useEffect(() => {
    setIsDark(getInitialTheme());
  }, []);

  // apply theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 md:pt-16">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-indigo-600">
            Pulse Connect
          </h1>

          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex justify-around items-center h-16 text-gray-500 dark:text-gray-400">
          <Link to="/" className="flex flex-col items-center p-2">
            <Home size={20} />
            <span className="text-[10px]">Home</span>
          </Link>

          <Link to="/study" className="flex flex-col items-center p-2">
            <BookOpen size={20} />
            <span className="text-[10px]">Study</span>
          </Link>

          <Link to="/announcements" className="flex flex-col items-center p-2">
            <Megaphone size={20} />
            <span className="text-[10px]">News</span>
          </Link>

          <Link to="/profile" className="flex flex-col items-center p-2">
            <User size={20} />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}