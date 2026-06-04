import {
  Home,
  MessageCircle,
  Megaphone,
  BookOpen,
  MapPin,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/messages", icon: MessageCircle, label: "Chat" },
    { to: "/study", icon: BookOpen, label: "Study" },
    { to: "/announcements", icon: Megaphone, label: "News" },
    { to: "/map", icon: MapPin, label: "Map" },
  ];

  return (
    <nav aria-label="Bottom navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t">
      <div className="flex justify-between max-w-md mx-auto px-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center flex-1 transition ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}