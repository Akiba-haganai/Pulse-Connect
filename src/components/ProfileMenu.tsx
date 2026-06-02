import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { User as UserIcon, Store, Settings, LogOut, BookOpen } from 'lucide-react';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, profile, signOut, fetchProfile } = useAuthStore();

  // Sync profile data if it hasn't loaded into state yet
  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile]);

  // Handle fallback or initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'P';
  };

  const handleLogOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {/* Modern Interactive Avatar Trigger */}
        <div className="h-9 w-9 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-transparent hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all cursor-pointer overflow-hidden">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl p-1 z-50 animate-in fade-in-50 slide-in-from-top-1">
        {/* User Identity Header */}
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {profile?.full_name || 'Campus User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
              @{profile?.username || 'username'}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

        {/* Navigation Actions */}
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <UserIcon size={16} className="text-gray-400" />
            <Link to="/profile" className="w-full text-left">My Profile</Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <Store size={16} className="text-gray-400" />
            <Link to="/marketplace" className="w-full text-left">Marketplace</Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <BookOpen size={16} className="text-gray-400" />
            <Link to="/study-hub" className="w-full text-left">Study Hub</Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <Settings size={16} className="text-gray-400" />
            <Link to="/settings" className="w-full text-left">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

        {/* Destructive Sign Out */}
        <DropdownMenuItem 
          onClick={handleLogOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors font-medium"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}