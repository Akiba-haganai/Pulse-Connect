import MarketWelcomeBanner from '../components/MarketWelcomeBanner';
import MarketplaceFeed from '../components/MarketplaceFeed'; 

export default function MarketHome() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* 1. Ecosystem loop bridge greeting */}
      <MarketWelcomeBanner />

      {/* 2. Heavy-duty Marketplace Transaction Grid */}
      <main className="px-4 py-2">
         {/* You must render the component here to stop the "unused" error */}
         <MarketplaceFeed /> 
      </main>

    </div>
  );
}