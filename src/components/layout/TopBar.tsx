import { useAuthStore } from '../../store/authStore';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationsDropdown'; // 🌟 Clean drop-in import

export default function TopBar() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm transition-colors">
      <div className="flex items-center justify-between mx-auto max-w-md">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Pulse Connect</h1>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* 🌟 REPLACED STATIC ICON BUTTON WITH YOUR LIVE COMPONENT */}
          <NotificationDropdown />
          
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
              {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}