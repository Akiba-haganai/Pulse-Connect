import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingBag, MessageSquare, Tag 
} from 'lucide-react';
import SafeAdZone from './SafeAdZone'; // Imports your ad block safe container

// Pre-configured localized item categories for Copperbelt University campus life
const MARKET_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'academics', label: 'Books & Stationery' },
  { id: 'electronics', label: 'Laptops & Phones' },
  { id: 'accommodation', label: 'Boarding & Rooms' },
  { id: 'clothing', label: 'Fashion & Style' },
];

// Mock database payload array mirroring Supabase schema output structural states
const MOCK_MARKET_DATA = [
  {
    id: "prod-1",
    title: "HP EliteBook 840 G5 (Core i5)",
    price: 4800, // Expressed natively in Zambian Kwacha (ZMW)
    category: "electronics",
    condition: "Used - Like New",
    description: "8GB RAM, 256GB SSD. Perfect for engineering and computing students. Battery holds 4+ hours. Comes with charger.",
    image_url: null, 
    seller_name: "Mwansa K.",
    seller_phone: "+260971234567", // Standard Zambian phone format framework
    created_at: new Date().toISOString()
  },
  {
    id: "prod-2",
    title: "Understanding University Mathematics Textbook",
    price: 250,
    category: "academics",
    condition: "Good Condition",
    description: "Essential for MA110/MA120 courses. Clean pages, no highlights or pen marks. Price slightly negotiable.",
    image_url: null,
    seller_name: "Chipo M.",
    seller_phone: "+260965987654",
    created_at: new Date().toISOString()
  }
];

export default function MarketplaceFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Client-side quick sort engine array
  const filteredProducts = useMemo(() => {
    return MOCK_MARKET_DATA.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // 📡 AUTOMATED WHATSAPP CONTACT BRIDGE ROUTER
  const handleContactSeller = (sellerPhone: string, itemTitle: string, itemPrice: number) => {
    // Clean telephone prefixes to prevent API string validation drops
    const formattedPhone = sellerPhone.replace(/[^0-9]/g, '');
    
    // Construct a pre-populated context text message to remove buyer hesitation
    const baseMessage = `Hi! I found your listing for "${itemTitle}" (K${itemPrice}) on Pulse Connect. Is it still available?`;
    const encodedMessage = encodeURIComponent(baseMessage);
    
    // Fire safe external system application link router window
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white dark:bg-black font-sans relative overflow-hidden">
      
      {/* HEADER HUD COMPONENT WITH FILTER STRIP */}
      <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 space-y-3 z-10 shadow-xs text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Campus Marketplace</h2>
            <p className="text-[11px] font-semibold text-gray-400">Buy & Sell inside Copperbelt University</p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag size={15} />
          </div>
        </div>

        {/* LOOKUP INPUT */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="What are you looking to buy today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* CATEGORY LIST SCROLLER */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MARKET_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEED PRODUCT ITERATION CARDS FRAME */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-900 rounded-2xl p-6">
            <Tag size={24} className="mx-auto text-gray-300 dark:text-gray-700" />
            <p className="text-xs font-bold text-gray-400 mt-2">No active store items match your search</p>
          </div>
        ) : (
          filteredProducts.map((item, index) => (
            <React.Fragment key={item.id}>
              {/* Individual Listing Card */}
              <div className="bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-900 rounded-2xl p-4 space-y-3 shadow-xs text-left transition-all hover:border-gray-300 dark:hover:border-gray-800">
                {/* Image Skeleton Frame Component Box */}
                <div className="w-full aspect-video bg-gray-200 dark:bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <ShoppingBag size={24} className="text-gray-400 dark:text-gray-700" />
                  <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                    {item.condition}
                  </span>
                </div>

                {/* Card Meta Description Text */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      K{item.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Divider Border Line */}
                <div className="h-px bg-gray-200 dark:bg-gray-900" />

                {/* Interactive Context Action Bar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[10px] font-medium text-gray-400">
                    Seller: <span className="font-bold text-gray-700 dark:text-gray-300">{item.seller_name}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleContactSeller(item.seller_phone, item.title, item.price)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <MessageSquare size={13} />
                    <span>Contact on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* 🎯 INJECT SAFELY AFTER THE FIRST FULL ITEM CARD VALUE */}
              {index === 0 && (
                <SafeAdZone 
                  slotId="9876543210" 
                  format="rectangle" 
                  className="my-2" 
                />
              )}
            </React.Fragment>
          ))
        )}
      </div>

    </div>
  );
}