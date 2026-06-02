import React, { useState, useMemo } from 'react';
import { 
  Search, Compass, ChevronRight, ArrowLeft, FileText, Activity 
} from 'lucide-react';

const SAMPLE_CAMPUS_LOCATIONS = [
  {
    id: "bursar",
    name: "Bursar Office",
    buildingName: "Administration Block",
    floor: "1st Floor",
    roomNumber: "A101",
    category: "Administration",
    description: "Handles tuition payments, clearance, and student billing inquiries.",
    hours: "8:00 AM - 5:00 PM",
    services: [
      { id: "s1", name: "Fee Payment" },
      { id: "s2", name: "Clearance Processing" }
    ],
    documents: [
      { id: "d1", document_name: "Student ID Card" },
      { id: "d2", document_name: "Fee Receipt" }
    ],
    faqs: [
      { id: "f1", question: "How do I pay my fees?", answer: "Visit the bursar office or pay online through the student portal." }
    ],
    x: 48,
    y: 28
  },
  {
    id: "ict-helpdesk",
    name: "ICT Helpdesk",
    buildingName: "Technology Hub",
    floor: "Ground Floor",
    roomNumber: "G002",
    category: "Technology Support",
    description: "Support desk for student portal access, Wi-Fi issues, and login recovery.",
    hours: "9:00 AM - 4:30 PM",
    services: [
      { id: "s3", name: "Student Portal Support" },
      { id: "s4", name: "Wi-Fi and Network Help" }
    ],
    documents: [
      { id: "d3", document_name: "Proof of Enrollment" }
    ],
    faqs: [
      { id: "f2", question: "What can ICT helpdesk assist with?", answer: "Password resets, portal access, and campus Wi-Fi help." }
    ],
    x: 64,
    y: 42
  },
  {
    id: "registrar",
    name: "Registrar Office",
    buildingName: "Student Services Complex",
    floor: "2nd Floor",
    roomNumber: "R210",
    category: "Student Records",
    description: "Processes academic records, transcripts, and student ID replacement.",
    hours: "8:30 AM - 5:00 PM",
    services: [
      { id: "s5", name: "Transcript Requests" },
      { id: "s6", name: "ID Card Replacement" }
    ],
    documents: [
      { id: "d4", document_name: "Birth Certificate" },
      { id: "d5", document_name: "Application Form" }
    ],
    faqs: [
      { id: "f3", question: "Can I collect my transcript today?", answer: "Transcript processing may take 2-3 business days after payment." }
    ],
    x: 34,
    y: 60
  }
];

const useCampusLocations = () => {
  const [locations] = useState<any[]>(SAMPLE_CAMPUS_LOCATIONS);
  const [loading] = useState(false);

  return { locations, loading };
};

const AdSenseSlot = ({
  slotId,
  className,
}: {
  slotId: string;
  format?: string;
  layoutKey?: string;
  className?: string;
}) => (
  <div className={`p-4 bg-indigo-50/30 dark:bg-indigo-950/20 border border-dashed border-indigo-100 dark:border-indigo-900/40 rounded-xl text-left my-2 ${className ?? ''}`}>
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
        Sponsored
      </span>
      <span className="text-[9px] text-gray-400">ID: {slotId}</span>
    </div>
    <p className="text-xs font-bold text-gray-900 dark:text-white mt-1.5">Need fast printing at the Library?</p>
    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Get 10% off high-volume assignment prints today only.</p>
  </div>
);

const WIZARD_TASKS = [
  { id: "w1", actionText: "Pay my Tuition Fees / Get Clearance", targetId: "bursar" },
  { id: "w2", actionText: "Fix my Locked Student Portal / Wi-Fi", targetId: "ict-helpdesk" },
  { id: "w3", actionText: "Replace my lost Student ID Card", targetId: "registrar" },
  { id: "w4", actionText: "Collect my Official Transcript", targetId: "registrar" }
];

export default function CampusMap() {
  // 🛠️ FIX: Using the optimized caching hook engine
  const { locations, loading } = useCampusLocations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<any | null>(null);
  const [showVisualMap, setShowVisualMap] = useState(false);

  const matchedLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return locations.filter(loc => {
      const matchesLoc = loc.name?.toLowerCase().includes(q) || loc.buildingName?.toLowerCase().includes(q);
      const matchesCategory = loc.category?.toLowerCase().includes(q);
      const matchesService = loc.services?.some((s: any) => s.name?.toLowerCase().includes(q));
      const matchesFAQ = loc.faqs?.some((f: any) => f.question?.toLowerCase().includes(q) || f.answer?.toLowerCase().includes(q));
      
      return matchesLoc || matchesCategory || matchesService || matchesFAQ;
    });
  }, [searchQuery, locations]);

  const handleSelectLocation = (locationId: string) => {
    const loc = locations.find((l: any) => l.id === locationId);
    if (loc) {
      setSelectedLoc(loc);
      setShowVisualMap(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    // 🛠️ FIX: Upgraded to True Black background primitives for high-contrast dark modes
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-md mx-auto bg-white dark:bg-black font-sans relative overflow-hidden">
      
      {!showVisualMap ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-5 pb-24">
          
          {/* SEARCH HUD */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight text-left">Campus Directory</h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="What are you trying to find or do?"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (selectedLoc) setSelectedLoc(null); }}
                className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white shadow-xs"
              />
            </div>
          </div>

          {/* STREAM FILTER RESULTS */}
          {searchQuery && matchedLocations.length > 0 && !selectedLoc && (
            <div className="space-y-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-2xl p-1.5 shadow-xs">
              <p className="text-[9px] font-black text-gray-400 px-3 py-1.5 uppercase tracking-wider text-left">Matching Offices</p>
              
              {matchedLocations.map((loc: any, index: number) => (
                <React.Fragment key={loc.id}>
                  <button
                    onClick={() => handleSelectLocation(loc.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-black border border-transparent hover:border-gray-100 dark:hover:border-gray-900 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{loc.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{loc.buildingName} • {loc.floor} ({loc.roomNumber})</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>

                  {/* 🛠️ FIX: Cleaner Ad injection inside list mapping wrappers */}
                  {index === 1 && (
                    <div className="px-2 py-1">
                      <AdSenseSlot slotId="1234567890" format="fluid" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* WIZARD ENGINE CONTAINER */}
          {!searchQuery && !selectedLoc && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <Compass size={15} className="text-indigo-500" />
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">"Where Do I Go?" Wizard</h3>
              </div>
              <div className="space-y-2">
                {WIZARD_TASKS.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectLocation(task.targetId)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-xl text-left hover:border-indigo-400 dark:hover:border-indigo-800 shadow-xs transition-all group"
                  >
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.actionText}</span>
                    <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NOTION METADATA DRAWER CONTENT */}
          {selectedLoc && (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 px-2 py-1 rounded-md">
                  {selectedLoc.roomNumber} ({selectedLoc.floor})
                </span>
                <h3 className="text-base font-black text-gray-900 dark:text-white mt-2">{selectedLoc.name}</h3>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{selectedLoc.buildingName}</p>
              </div>

              {selectedLoc.description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed text-left">{selectedLoc.description}</p>
              )}
              
              {selectedLoc.hours && (
                <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 text-left">🕒 Office Hours: {selectedLoc.hours}</div>
              )}

              {/* SERVICES BLOCK */}
              {selectedLoc.services && selectedLoc.services.length > 0 && (
                <div className="space-y-1.5 pt-1 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Services Provided:</p>
                  {selectedLoc.services.map((s: any) => (
                    <div key={s.id} className="flex items-start gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span className="text-indigo-500">✓</span>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* REQUIRED PREREQUISITES SHEET */}
              {selectedLoc.documents && selectedLoc.documents.length > 0 && (
                <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/80 dark:border-amber-900/30 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    <FileText size={12} />
                    <span>Prerequisite Documents To Bring:</span>
                  </div>
                  {selectedLoc.documents.map((d: any) => (
                    <div key={d.id} className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{d.document_name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowVisualMap(true)}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Compass size={14} />
                <span>Show On Map Location Highlight</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VIEWSTATE 2: HIGHLIGHT CANVAS */
        <div className="flex-1 flex flex-col relative animate-fadeIn">
          <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 flex items-center gap-3 z-10 text-left">
            <button 
              type="button"
              onClick={() => setShowVisualMap(false)} 
              aria-label="Go back"
              title="Go back"
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">{selectedLoc?.name}</h4>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{selectedLoc?.buildingName} • {selectedLoc?.roomNumber}</p>
            </div>
          </div>

          <div className="flex-1 bg-gray-50 dark:bg-black p-4 flex items-center justify-center relative overflow-hidden">
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
                const clickY = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
                console.log(`Plot coordinates -> X: ${clickX}, Y: ${clickY}`);
              }}
              className="w-full aspect-4/5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-900 relative shadow-lg overflow-hidden cursor-crosshair"
            >
              <img 
                src="/assets/campus-map-base.png" 
                alt="Campus Map Base Plan" 
                className="w-full h-full object-cover opacity-90 dark:opacity-40 select-none pointer-events-none"
              />
              
              {selectedLoc && (
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500"
                  /* eslint-disable-next-line */
                  style={{ top: `${selectedLoc.y}%`, left: `${selectedLoc.x}%` }}
                >
                  <div className="p-2.5 rounded-full bg-indigo-600 text-white scale-110 shadow-xl ring-4 ring-indigo-100 dark:ring-indigo-950 relative">
                    <Activity size={16} />
                    <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-40" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}