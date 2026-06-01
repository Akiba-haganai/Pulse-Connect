// Local feature imports (Simpler!)
import ProfileHeader from './ProfileHeader';
import ProfileSettings from './ProfileSettings';
import ProfileSecurity from './ProfileSecurity';
import { useProfileStats } from './hooks/useProfileStats';
import { calculateProfileCompletion } from './utils/profileCompletion';


// Global stores/types step out an extra layer
import { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';

// Icon Core Blocks
import { FileCheck, TrendingUp, Users, Flame, Star, Award, User, Settings, LogOut} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuthStore();
  const { stats } = useProfileStats(profile?.id);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Compute profile complete matrix data dynamically
  const profileCompletion = useMemo(() => calculateProfileCompletion(profile), [profile]);

  // Dynamic Badges Matrix Configuration
  const unlockedAccolades = useMemo(() => {
    const accomplishments = [];
    if (stats.total_uploads >= 1) {
      accomplishments.push({ id: 'a1', title: 'Genesis Contributor', desc: 'Uploaded your first verified study resource node.', variant: 'text-blue-600 bg-blue-50 border-blue-100' });
    }
    if (stats.total_uploads >= 5) {
      accomplishments.push({ id: 'a2', title: 'Academic Pillar', desc: 'Cataloged over 5 study resources to your institutional branch.', variant: 'text-emerald-600 bg-emerald-50 border-emerald-100' });
    }
    if (stats.total_accrued_downloads >= 25) {
      accomplishments.push({ id: 'a3', title: 'Viral Intelligence', desc: 'Your indexed files have served over 25 individual peer downloads.', variant: 'text-amber-600 bg-amber-50 border-amber-100' });
    }
    if (profile?.verified_academic) {
      accomplishments.push({ id: 'a4', title: 'Verified Intellect', desc: 'Manually audited and approved structural domain author.', variant: 'text-indigo-600 bg-indigo-50 border-indigo-100' });
    }
    return accomplishments;
  }, [stats, profile]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 py-4 animate-fade-in">
      
      {/* 1. Header Hero Panel Block */}
      <ProfileHeader profile={profile} email={user?.email} stats={stats} />

      {/* Profile Completion Tracking Bar */}
      {profileCompletion.percentage < 100 && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-amber-800">
            <span>Profile Asset Optimization Metrics</span>
            <span>{profileCompletion.percentage}% Completed</span>
          </div>
          <div className="w-full bg-gray-200/60 h-1.5 rounded-full overflow-hidden">
            {/* Injected CSS rule to avoid inline styles for dynamic width */}
            <style>{`.profile-progress-fill { width: ${profileCompletion.percentage}%; }`}</style>
            <div className="bg-amber-500 h-full transition-all duration-500 profile-progress-fill" />
          </div>
          <p className="text-[10px] font-semibold text-amber-700/90">💡 Suggestion: {profileCompletion.nextActionSuggestion}</p>
        </div>
      )}

      {/* 2. Statistical Metrics Grid Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FileCheck size={16} /></div>
          <div>
            <div className="text-base font-bold text-gray-900">{stats.total_uploads}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploads</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={16} /></div>
          <div>
            <div className="text-base font-bold text-gray-900">{stats.total_accrued_downloads}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accrued Hits</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Users size={16} /></div>
          <div>
            <div className="text-base font-bold text-gray-900">{stats.follower_count}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Followers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Flame size={16} /></div>
          <div>
            <div className="text-base font-bold text-gray-900">{profile?.global_rank ? `#${profile.global_rank}` : 'Top 5%'}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Global Rank</div>
          </div>
        </div>
      </div>

      {/* 3. Lower Workspace Execution Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Workspace Active Views Form Control Blocks (Cols: 2) */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' ? (
            <>
              <ProfileSettings profile={profile} />
              
              {/* Gamified Achievements Segment Block */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Star size={16} className="text-amber-500 fill-amber-400" /> Unlocked System Milestones
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">Earned accolades linked directly to peer file downloads and profile tracking data streams</p>
                </div>

                {unlockedAccolades.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs font-medium">
                    No academic milestones unlocked yet. Index educational assets to start ranking.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unlockedAccolades.map((badge) => (
                      <div key={badge.id} className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all hover:scale-[1.01] ${badge.variant}`}>
                        <div className="p-1.5 bg-white/90 rounded-lg shrink-0 shadow-3xs"><Award size={14} /></div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">{badge.title}</h4>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <ProfileSecurity />
          )}
        </div>

        {/* Action Controls Side Navigation Menu Bar Component Blocks (Cols: 1) */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs h-fit">
          <div className="p-3 border-b border-gray-50 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Navigation Console
          </div>
          <div className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${activeTab === 'profile' ? 'text-indigo-600 bg-indigo-50/10 font-bold' : 'hover:bg-gray-50'}`}
            >
              <User size={16} className={activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'} />
              <span>Workspace Preferences</span>
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${activeTab === 'security' ? 'text-indigo-600 bg-indigo-50/10 font-bold' : 'hover:bg-gray-50'}`}
            >
              <Settings size={16} className={activeTab === 'security' ? 'text-indigo-600' : 'text-gray-400'} />
              <span>Security Configurations</span>
            </button>
            
            <button
              onClick={signOut}
              className="w-full p-3.5 flex items-center gap-3 text-left text-red-600 hover:bg-red-50/50 transition-colors"
            >
              <LogOut size={16} />
              <span>Terminate Session Node</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}