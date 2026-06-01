import { useNavigate } from 'react-router-dom';
import { usePeerSearch } from './usePeerSearch';
import { useStartChat } from '../profile/hooks/useStartChat';
import { useAuthStore } from '../../store/authStore';
import { Search, SlidersHorizontal, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { peers, searchQuery, setSearchQuery, selectedRole, setSelectedRole, isLoading } = usePeerSearch();
  const { startPrivateChat, isInitializing } = useStartChat();

  const roleFilters = [
    { id: 'all', label: 'All Nodes' },
    { id: 'student', label: 'Students' },
    { id: 'professor', label: 'Faculty' },
    { id: 'moderator', label: 'Staff/Mods' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 🔍 HEADER SEARCH CONTROLS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs space-y-4">
        <div>
          <h1 className="text-md font-bold text-gray-900">Campus Node Directory</h1>
          <p className="text-[11px] text-gray-400 font-medium">Discover and initialize secure pipelines with peer academic vectors</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Text input channel */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by legal name or active node handler string..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
            />
          </div>

          {/* Role Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
            {roleFilters.map((filter) => {
              const isSelected = selectedRole === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedRole(filter.id)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-white border border-gray-200/60 text-indigo-600 shadow-3xs' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🎚️ GRID DIRECTORY DISCOVERY FIELD */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
          <span className="text-[11px] font-medium text-gray-400">Syncing node queries...</span>
        </div>
      ) : peers.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl text-center py-20 px-4">
          <SlidersHorizontal className="mx-auto text-gray-300 mb-2" size={24} />
          <h3 className="text-xs font-bold text-gray-900">Zero Node Intersections</h3>
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto mt-1 leading-normal">
            No academic matches were detected evaluating those query conditions. Adjust search text definitions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {peers.map((peer) => {
            const isSelf = peer.id === currentUser?.id;
            
            return (
              <div 
                key={peer.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex flex-col justify-between hover:border-gray-200 transition-all group"
              >
                {/* Upper Identity Blocks */}
                <div className="flex gap-3 items-start">
                  <div 
                    onClick={() => navigate(`/profile/${peer.id}`)}
                    className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-100/40 cursor-pointer overflow-hidden shadow-3xs"
                  >
                    {peer.avatar_url ? (
                      <img src={peer.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (peer.full_name?.charAt(0) || 'U').toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate(`/profile/${peer.id}`)}>
                      <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {peer.full_name || 'Anonymous User'}
                      </h4>
                      {peer.verified_academic && <ShieldCheck size={12} className="text-indigo-500 fill-indigo-50 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium truncate">@{peer.username}</p>
                    
                    {/* Role Mini Badge Component */}
                    <span className={`inline-block mt-1 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                      peer.role === 'professor' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      peer.role === 'moderator' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      peer.role === 'admin' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600'
                    }`}>
                      {peer.role || 'student'}
                    </span>
                  </div>
                </div>

                {/* Lower Bio & Navigation Controls */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col justify-between flex-1 gap-3">
                  <p className="text-[11px] text-gray-500 line-clamp-2 font-medium italic leading-relaxed">
                    {peer.bio ? `"${peer.bio}"` : 'No bio vectors established.'}
                  </p>

                  <div className="flex gap-1.5 w-full mt-auto">
                    <button 
                      onClick={() => navigate(`/profile/${peer.id}`)}
                      className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg transition-colors border border-gray-100"
                    >
                      View Node
                    </button>
                    
                    {!isSelf && (
                      <button 
                        onClick={() => startPrivateChat(peer.id)}
                        disabled={isInitializing}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-100/30"
                        title="Open message bridge"
                      >
                        <MessageSquare size={13} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}