import { Home, MessageCircle, Megaphone, User, ShoppingBag, BookOpen } from 'lucide-react'; // Added BookOpen
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageCircle, label: 'Chat' },
    { to: '/study', icon: BookOpen, label: 'Study' }, // Added this line
    { to: '/announcements', icon: Megaphone, label: 'News' },
    { to: '/marketplace', icon: ShoppingBag, label: 'Market' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-gray-200 bg-white pb-safe">
      <div className="flex items-center justify-around mx-auto max-w-md p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-colors min-w-15 ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[10px] mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
