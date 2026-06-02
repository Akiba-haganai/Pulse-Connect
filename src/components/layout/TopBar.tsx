import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationsDropdown';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '../ui/dropdown-menu';
import { User as UserIcon, Store, Settings, LogOut, BookOpen } from 'lucide-react';

export default function TopBar() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm transition-colors">
      <div className="flex items-center justify-between mx-auto max-w-md">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Pulse Connect</h1>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <NotificationDropdown />
          
          {/* 🌟 Dynamic Profile Dropdown Wrapper */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus:outline-none select-none">
              <div className="cursor-pointer transition-transform duration-200 active:scale-95">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-colors">
                    {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>

            {/* Lovable-Style Menu Contents aligned to the right anchor */}
            <DropdownMenuContent 
              align="end" 
              sideOffset={8}
              className="w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl p-1 z-50"
            >
              {/* Identity Headers */}
              <DropdownMenuLabel className="px-3 py-2.5 normal-case tracking-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {profile?.full_name || 'Campus User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                    @{profile?.username || 'username'}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />

              {/* Navigation Options */}
              <DropdownMenuGroup className="space-y-0.5">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full flex items-center gap-2">
                    <UserIcon size={16} className="text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/marketplace" className="w-full flex items-center gap-2">
                    <Store size={16} className="text-gray-400" />
                    <span>Marketplace</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/study-hub" className="w-full flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" />
                    <span>Study Hub</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full flex items-center gap-2">
                    <Settings size={16} className="text-gray-400" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Logout Action */}
              <DropdownMenuItem 
                onClick={handleLogOut}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 font-medium"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}