import { useState } from 'react';
import { Compass, Sparkles, X, ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function MarketWelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleReturnToGuide = () => {
    // Escape route deep link back to your primary Guide App instance
    window.location.href = 'https://pulseconnect.app';
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fadeIn">
      {/* 🤝 CORE HANDSHAKE CONTAINER */}
      <div className="bg-linear-to-r from-gray-900 via-indigo-950 to-gray-900 dark:from-white dark:via-indigo-50 dark:to-white text-white dark:text-gray-900 p-4 rounded-2xl shadow-xl relative overflow-hidden border border-indigo-500/20">
        
        {/* Abstract vector branding glows */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <button 
          type="button"
          aria-label="Close welcome banner"
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 p-1 rounded-full bg-white/10 dark:bg-gray-200 text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors"
        >
          <X size={12} />
        </button>

        <div className="space-y-3 text-left relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={12} className="animate-pulse" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 dark:bg-indigo-600/10 text-indigo-300 dark:text-indigo-600 px-2 py-0.5 rounded">
              Pulse Ecosystem Secure Link
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tight leading-snug">
              Welcome to CBU Campus Market
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
              Your profile node from the Guide app is mapped. You can list items and contact sellers instantly.
            </p>
          </div>

          {/* REVERSE CURIOSITY TRIGGER BUTTONS */}
          <div className="pt-1 grid grid-cols-2 gap-2">
            <button 
              onClick={handleReturnToGuide}
              className="flex items-center justify-center gap-1 py-2 bg-white/10 dark:bg-gray-100 hover:bg-white/20 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-[11px] font-bold rounded-xl transition-all"
            >
              <ArrowLeft size={11} />
              <span>Back to Guide</span>
            </button>
            
            <button 
              onClick={() => {
                // Instantly routes back to the map with an intention trigger parameter
                window.location.href = 'https://pulseconnect.app?view=map';
              }}
              className="flex items-center justify-center gap-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Compass size={11} />
              <span>Open Campus Map</span>
              <ArrowUpRight size={10} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}