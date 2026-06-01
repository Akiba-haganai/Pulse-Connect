import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <TopBar />

      <main className="flex-1 pb-16 pt-2">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}