import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeAdZoneProps {
  slotId: string;      // Your target Google AdSense Slot ID
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export default function SafeAdZone({ slotId, format = 'auto', className = '' }: SafeAdZoneProps) {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [hasAdInitialized, setHasAdInitialized] = useState(false);

  useEffect(() => {
    // 🕵️ ENGINE CHECK: Verify if external scripts are actively suppressed
    const detectAdBlocker = async () => {
      try {
        // Attempt to fetch a classic tracked script footprint identifier
        const testRequest = new Request(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
          { method: 'HEAD', mode: 'no-cors' }
        );
        await fetch(testRequest);
      } catch (error) {
        // Network dropped or actively rejected via system level blockades
        setIsAdBlockerActive(true);
      }
    };

    detectAdBlocker();
  }, []);

  useEffect(() => {
    // Only invoke script arrays if blockades aren't registered
    if (!isAdBlockerActive && !hasAdInitialized) {
      try {
        // Ensure the global namespace array has initialized safely
        const globalAds = (window as any).adsbygoogle || [];
        globalAds.push({});
        setHasAdInitialized(true);
      } catch (err) {
        console.warn('AdSense execution lifecycle intercept:', err);
      }
    }
  }, [isAdBlockerActive, hasAdInitialized]);

  // 🛡️ FALLBACK LAYOUT: Render fallback layout if an ad blocker is running
  if (isAdBlockerActive) {
    return (
      <div className={`w-full min-h-25 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-200 dark:border-gray-900 p-4 flex flex-col items-center justify-center text-center ${className}`}>
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider mb-1">
          <Sparkles size={12} />
          <span>Pulse Campus Notice</span>
        </div>
        <p className="text-[11px] font-semibold text-gray-500 max-w-60 leading-normal">
          Keep up with the latest updates! Check out the Study Hub for freshly uploaded resources and notes.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`w-full min-h-25 bg-gray-50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative ${className}`}
    >
      {/* Structural Label Badge indicator */}
      <span className="absolute top-1.5 left-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none z-10">
        Sponsored Advertisement
      </span>

      {/* Pure Google Native Container Object Component */}
      <div className="w-full flex justify-center py-6">
        <ins
          className="adsbygoogle block w-full"
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}