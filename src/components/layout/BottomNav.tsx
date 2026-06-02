import { Home, MessageCircle, Megaphone, User, BookOpen, Map } from 'lucide-react'; 
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageCircle, label: 'Chat' },
    { to: '/study', icon: BookOpen, label: 'Study' }, 
    { to: '/announcements', icon: Megaphone, label: 'News' },
    { to: '/map', icon: Map, label: 'Map' }, 
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] transition-colors">
      <div className="flex items-center justify-between mx-auto max-w-md px-1 py-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const baseClass = "flex flex-col items-center flex-1 py-1 rounded-xl transition-all duration-200 active:scale-90";
              const colorClass = isActive 
                ? "text-indigo-600 dark:text-indigo-400 font-semibold" 
                : "text-gray-500 dark:text-gray-400 hover:text-indigo-500";
              
              return `${baseClass} ${colorClass}`;
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] sm:text-[10px] mt-1 tracking-tight select-none">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}