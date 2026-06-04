import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, MessageSquare } from 'lucide-react';
import SafeAdZone from './SafeAdZone';

interface MarketItem {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  seller_name: string;
  seller_phone: string;
}

const MARKET_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'academics', label: 'Books & Stationery' },
  { id: 'electronics', label: 'Laptops & Phones' },
  { id: 'accommodation', label: 'Boarding & Rooms' },
  { id: 'clothing', label: 'Fashion & Style' },
];

export default function MarketplaceFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Memoize data to prevent re-filtering on every render
  const filteredProducts = useMemo(() => {
    // Replace MOCK_MARKET_DATA with your actual state once you fetch from Supabase
    return [] as MarketItem[]; 
  }, [searchQuery, activeCategory]);

  const handleContactSeller = (phone: string, title: string, price: number) => {
    const formatted = phone.replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(`Hi! I'm interested in your listing: "${title}" (K${price}).`);
    window.open(`https://wa.me/${formatted.replace('+', '')}?text=${msg}`, '_blank');
  };

  // ✅ FIX: Empty state UI
  if (!filteredProducts.length) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white dark:bg-black font-sans">
        <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1">
            {MARKET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-400 text-sm font-medium">No listings yet</p>
            <p className="text-gray-400 text-xs mt-1">Check back later for new items</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white dark:bg-black font-sans relative overflow-hidden">
      <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books, electronics, rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1">
          {MARKET_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredProducts.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h3>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">K{item.price}</span>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">{item.category}</span>
                <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">{item.condition}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-gray-400">@{item.seller_name}</span>
                <button
                  onClick={() => handleContactSeller(item.seller_phone, item.title, item.price)}
                  className="flex items-center gap-1 text-[10px] bg-green-600 text-white px-2 py-1 rounded-lg"
                >
                  <MessageSquare size={10} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
            {index === 0 && <SafeAdZone slotId="9876543210" format="rectangle" className="my-2" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}