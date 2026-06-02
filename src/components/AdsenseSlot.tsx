import { useEffect } from 'react';

interface AdSenseSlotProps {
  slotId: string;
  format?: 'auto' | 'fluid';
  layoutKey?: string;
  className?: string;
}

export default function AdSenseSlot({ slotId, format = 'auto', layoutKey, className = '' }: AdSenseSlotProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log('AdSense runtime not initialized or blocked by browser extensions.');
    }
  }, [slotId]);

  return (
    <div className={`w-full overflow-hidden my-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-2 flex flex-col items-center justify-center min-h-22.5 relative ${className}`}>
      
      {/* Background Micro-Labeling for Compliance */}
      <span className="absolute right-2 top-1 text-[8px] font-bold tracking-wider text-gray-300 dark:text-gray-700 uppercase pointer-events-none select-none">
        Sponsored
      </span>

      {/* Production Google AdSense Dynamic Wrapper Tag */}
      <ins
        className="adsbygoogle block w-full"
        data-ad-client="ca-pub-YOUR_ADSENSE_PUBLISHER_ID_HERE" // 👈 Swap with your verified account ID later
        data-ad-slot={slotId}
        data-ad-format={format}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
}