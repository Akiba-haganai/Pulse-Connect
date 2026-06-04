import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      
      {/* 🧠 TOP BAR (GLOBAL SHELL AREA) */}
      <TopBar />

      {/* 📦 MAIN CONTENT AREA (IMPORTANT: SINGLE SCROLL CONTAINER) */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto w-full px-2 py-4">
          <Outlet />
        </div>
      </main>

      {/* 📱 BOTTOM NAV (GLOBAL FIXED SHELL ELEMENT) */}
      <BottomNav />
    </div>
  );
}