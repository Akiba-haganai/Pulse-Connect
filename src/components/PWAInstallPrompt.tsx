import { useState, useEffect } from 'react';
import { Smartphone, Download, X, ArrowUpRight, Sparkles } from 'lucide-react';

// Extend the global Window interface to cleanly handle standard PWA event footprints
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 🕵️ DETECT IOS: Apple devices do not support 'beforeinstallprompt'
    const checkPlatform = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isAppleMobile);

      // If it's iOS, check if they aren't already running in standalone app mode
      if (isAppleMobile && !(window.navigator as any).standalone) {
        // Show the prompt after a 4-second delay so it doesn't interrupt their first paint
        const timer = setTimeout(() => setIsVisible(true), 4000);
        return () => clearTimeout(timer);
      }
    };

    checkPlatform();

    // 🤖 CHROMIUM / ANDROID SYSTEM HANDLER
    const handleBeforeInstallPrompt = (e: Event) => {
      // Stop the browser from firing its default bottom banner
      e.preventDefault();
      // Cache the event system state so we can trigger it when the user taps our button
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Reveal our custom, high-fidelity UI sheet
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger the native browser install utility interface
    await deferredPrompt.prompt();

    // Wait for the student to make a choice (Accept / Decline)
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('🎉 Pulse Connect successfully deployed to home screen.');
    }

    // Clean up our hook references and pull down the banner
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Safe visual exit wrapper if the state flags remain un-triggered
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-black border border-gray-200 dark:border-gray-900 shadow-2xl rounded-2xl z-50 p-4 animate-in slide-in-from-bottom duration-300 text-left">
      <div className="flex gap-3">
        
        {/* App Branding Icon Container */}
        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-indigo-500/20 relative overflow-hidden">
          <Smartphone size={22} />
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-black text-emerald-400 rounded-tl-md">
            <Sparkles size={8} />
          </span>
        </div>

        {/* Content Details Block */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
              Install Pulse Connect
            </h4>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal font-medium">
            {isIOS 
              ? 'Tap the Share icon below, then select "Add to Home Screen" for instant, data-efficient campus access.'
              : 'Add Pulse Connect to your device for smooth loading, faster access, and offline capability across campus.'
            }
          </p>
        </div>
      </div>

      {/* Action Footer Bar */}
      {!isIOS && (
        <div className="mt-3.5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Download size={13} />
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* Visual Indicator tail specifically targeting mobile Safari's layout flow */}
      {isIOS && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-900/60 flex items-center justify-center text-[10px] font-bold text-indigo-500 animate-pulse">
          <span>Follow Safari prompt below</span>
          <ArrowUpRight size={10} className="rotate-90 ml-0.5" />
        </div>
      )}
    </div>
  );
}