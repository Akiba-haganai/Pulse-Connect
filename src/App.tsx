import { useState } from 'react';
import Navbar from './components/Navbar';
import CampusMap from './components/CampusMap';
import StudyHub from './components/StudyHub';
import MarketplacePreview from './pages/MarketplacePreview';

export default function App() {
  const [view, setView] = useState<string>('map');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased overflow-x-hidden">
      {/* Standard Global Navigation Switcher Header */}
      <Navbar currentView={view} setView={setView} />

      {/* Main Core Presentation Router Port */}
      <main className="w-full transition-opacity duration-200">
        {view === 'map' && <CampusMap />}
        {view === 'study' && <StudyHub />}
        {view === 'marketplace-preview' && <MarketplacePreview />}
      </main>
    </div>
  );
}