import CampusMap from '../components/CampusMap'; // Adjust this path to where your component lives

export default function MapPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Page Context Announcement for Freshmen */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/50">
        <p className="text-xs text-center font-medium text-indigo-600 dark:text-indigo-400">
          📍 Campus Navigator: Tap on any location pin for room directories & walking paths.
        </p>
      </div>

      {/* The Map Component Workspace */}
      <CampusMap />
    </main>
  );
}