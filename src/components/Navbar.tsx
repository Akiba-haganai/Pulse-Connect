import { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  BookOpen, 
  ChevronDown, 
  ArrowRight, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Navbar({ currentView, setView }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if student clicks outside the element frame bounds
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const appModules = [
    {
      id: 'map',
      label: 'Campus Guide & Map',
      description: 'Frictionless navigation across CBU blocks',
      icon: MapPin,
      activeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
    },
    {
      id: 'study',
      label: 'Academic Study Hub',
      description: 'Crowdsourced exam papers & lecture material',
      icon: BookOpen,
      activeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: 'marketplace-preview',
      label: 'Campus Market',
      description: 'Sneak peek at student items and side-hustles',
      icon: ShoppingBag,
      activeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
      badge: 'Hot'
    }
  ];

  const activeModule = appModules.find(m => m.id === currentView) || appModules[0];

  return (
    <header className="w-full max-w-md mx-auto h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between sticky top-0 z-50 font-sans">
      
      {/* LEFT: INTEGRATED INTERCONNECTED PLATFORM SWITCHER TRUNK */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all active:scale-98 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Pulse
            </span>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Connect
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700">
            <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* ECOSYSTEM DROP-DOWN EXTENSION BOARD */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-2 animate-fadeIn z-50 space-y-1">
            <div className="px-2.5 py-1.5 mb-1">
              <p className="text-[9px] font-black tracking-wider uppercase text-gray-400">Switch Application Node</p>
            </div>

            {appModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = mod.id === currentView;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setView(mod.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left group ${
                    isSelected 
                      ? 'bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700' 
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isSelected ? mod.activeColor : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                    <Icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {mod.label}
                      </p>
                      {mod.badge && (
                        <span className="text-[8px] font-black uppercase tracking-wide bg-emerald-500 text-white px-1.5 py-0.2 rounded-md animate-pulse">
                          {mod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1 leading-normal font-medium">
                      {mod.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* QUICK LINK TO EXTERNAL STANDALONE APP ENTRY */}
            <div className="pt-1.5 mt-1 border-t border-gray-100 dark:border-gray-800">
              <a 
                href="https://market.pulseconnect.app"
                target="_blank"
                rel="noreferrer noopener"
                className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors group"
              >
                <div className="flex items-center gap-2 pl-1">
                  <Sparkles size={12} className="animate-spin-slow" />
                  <span className="text-[10px] font-extrabold tracking-tight">Open Dedicated Web Market</span>
                </div>
                <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: CURRENT ACTIVE MODULE CONTEXT LABEL */}
      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-xl pointer-events-none select-none">
        <div className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${currentView === 'marketplace-preview' ? 'bg-emerald-500 animate-pulse' : ''}`} />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {activeModule.label.split(' ')[0]} Hub
        </span>
      </div>

    </header>
  );
}