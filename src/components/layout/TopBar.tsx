import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import NotificationDropdown from "./NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import {
  User as UserIcon,
  Store,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";

export default function TopBar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.username || user?.email?.split("@")[0] || "User";
  const displayInitial = profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mx-auto max-w-md">

        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          Pulse Connect
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="profile"
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayInitial}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">
                  {profile?.full_name || displayName}
                </p>
                <p className="text-xs text-gray-500">
                  @{displayName}
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex gap-2 items-center">
                    <UserIcon size={16} />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/marketplace" className="flex gap-2 items-center">
                    <Store size={16} />
                    Marketplace
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/study" className="flex gap-2 items-center">
                    <BookOpen size={16} />
                    Study
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex gap-2 items-center">
                    <Settings size={16} />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {profile?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex gap-2 items-center">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {profile?.role === "professor" && (
                  <DropdownMenuItem asChild>
                    <Link to="/professor" className="flex gap-2 items-center">
                      Professor Tools
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogOut} className="text-red-500 cursor-pointer">
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}