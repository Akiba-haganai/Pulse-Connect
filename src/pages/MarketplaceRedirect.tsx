import { useEffect } from 'react';

export default function MarketplaceRedirect() {
  useEffect(() => {
    window.location.href = "https://market.lovemat.app";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">Redirecting to Campus Market...</h2>
      <p className="text-gray-500 mt-2">Please wait while we transfer you.</p>
    </div>
  );
}