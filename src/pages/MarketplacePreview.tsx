import { 
  ShoppingBag, 
  TrendingUp, 
  Activity, 
  ExternalLink, 
  Smartphone, 
  Sparkles,
  Zap,
  Flame
} from 'lucide-react';

// Highly contextual mock data modeling what CBU students actually look for
const TRENDING_CARDS = [
  {
    id: 't1',
    title: 'Engineering Lab Coats & Goggles',
    price: 'ZK 180.00',
    demand: 'High Demand',
    category: 'Equipment',
    metric: '42 students viewing today'
  },
  {
    id: 't2',
    title: 'Room Sublet Sharing — Hostel 4',
    price: 'ZK 850.00/sem',
    demand: 'Selling Fast',
    category: 'Accommodation',
    metric: '12 inquiries in last 2 hours'
  },
  {
    id: 't3',
    title: 'Rapid Printing & Binding Service',
    price: 'ZK 1.50/page',
    demand: 'Top Rated',
    category: 'Services',
    metric: 'Most popular in School of Technology'
  },
  {
    id: 't4',
    title: 'HP EliteBook Laptop (Refurbished)',
    price: 'ZK 4,200.00',
    demand: 'Price Drop',
    category: 'Electronics',
    metric: '15 students bookmarked this'
  }
];

const CAMPUS_PULSE_METRICS = [
  { zone: 'ICT Block Alpha', activity: 'Highly Active', context: 'Buying exam past-papers & notes printouts', load: 88, widthClass: 'w-[88%]' },
  { zone: 'Hostel 5 Common Room', activity: 'Spike in Listings', context: 'Bedspace allocations & appliance trade', load: 74, widthClass: 'w-[74%]' },
  { zone: 'School of Medicine (SoM)', activity: 'Steady Trade', context: 'Medical kits, stethoscopes & study references', load: 45, widthClass: 'w-[45%]' }
];

export default function MarketplacePreview() {
  
  const handleLaunchMarketplace = () => {
    // Deep link targeting your separate deployment shell environment
    window.open('https://market.pulseconnect.app', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 dark:bg-gray-950 font-sans pb-12 select-none">
      
      {/* 🚀 ECOSYSTEM HEADER ZONE */}
      <div className="p-5 bg-linear-to-b from-indigo-50/50 via-white to-gray-50 dark:from-indigo-950/20 dark:via-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-900 text-left pt-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20 animate-pulse">
            <ShoppingBag size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md">
            Ecosystem Extension
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Campus Market
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
          See what items, side-hustles, and services fellow students are launching across the Copperbelt University network right now.
        </p>
      </div>

      {/* 🔮 CURIOSITY TRIGGER: LIVE INVENTORY DISCOVERY PORT */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Flame size={15} className="text-orange-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Trending on Campus
            </h2>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
            Live Feed <Zap size={10} />
          </span>
        </div>

        {/* INVENTORY MOCK GRID STREAM */}
        <div className="grid grid-cols-1 gap-2.5">
          {TRENDING_CARDS.map((card) => (
            <div 
              key={card.id}
              onClick={handleLaunchMarketplace}
              className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl flex flex-col justify-between hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    {card.category}
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {card.title}
                  </h3>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
                    {card.price}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-gray-400 font-medium">
                  <Activity size={11} className="text-indigo-500" />
                  <span>{card.metric}</span>
                </div>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded">
                  {card.demand}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 📊 DATA SECTION: CAMPUS PULSE INSIGHTS MAPPER */}
        <div className="mt-6 pt-2 space-y-3">
          <div className="flex items-center gap-1.5 px-1">
            <TrendingUp size={15} className="text-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Campus Trading Density
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5 shadow-xs">
            {CAMPUS_PULSE_METRICS.map((pulse, i) => (
              <div key={i} className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{pulse.zone}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{pulse.context}</p>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    {pulse.activity}
                  </span>
                </div>
                {/* Micro Visual Load Bar tracking system engagement parameters */}
                <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500 ${pulse.widthClass}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚪 CONVERSION ZONE: ECOSYSTEM ESCALATOR BANNER */}
        <div className="mt-4 p-4 rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-left relative overflow-hidden shadow-lg border border-gray-800 dark:border-gray-200">
          <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none transform rotate-12">
            <Smartphone size={120} />
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-1 text-indigo-400 dark:text-indigo-600 text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} /> Seamless Sandbox Handshake
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Ready to close a transaction?</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-normal">
                Your primary account layout matrix token maps instantly into our processing engine window layer.
              </p>
            </div>
            
            <button 
              onClick={handleLaunchMarketplace}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-transform active:scale-98"
            >
              <span>Launch Campus Market Shell</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}