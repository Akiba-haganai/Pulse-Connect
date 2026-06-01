import { useState } from 'react';
import { Shield, Award, User, CheckCircle, Edit3, Save, Users, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useStartChat } from './hooks/useStartChat'; // Import our messaging trigger hook!
import type { Profile, ProfileStats } from '../../types/profile';

interface HeaderProps {
  profile: Profile | null;
  email?: string;
  stats: ProfileStats;
}

export default function ProfileHeader({ profile, email, stats }: HeaderProps) {
  // Grab current authenticated session user state context
  const { user: currentUser } = useAuthStore();
  const { startPrivateChat, isInitializing } = useStartChat();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // Check if this profile view block represents the active session user
  const isOwnProfile = currentUser?.id === profile?.id;

  const handleSaveBio = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bioText.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Bio status updated successfully.');
      setIsEditingBio(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed processing biography data updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const roleStyles = {
    admin: { bg: 'bg-red-50 text-red-700 border-red-200', icon: <Shield size={12} /> },
    professor: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Award size={12} /> },
    moderator: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Shield size={12} /> },
    student: { bg: 'bg-gray-100 text-gray-700 border-gray-200', icon: <User size={12} /> }
  };

  const currentRole = profile?.role || 'student';
  const badgeConfig = roleStyles[currentRole as keyof typeof roleStyles] || roleStyles.student;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 relative overflow-hidden shadow-xs">
      <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/30 rounded-bl-full pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 relative z-10">
        <div className="h-24 w-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-sm border-2 border-white ring-4 ring-indigo-50 shrink-0 overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile Avatar" className="h-full w-full object-cover" />
          ) : (
            (profile?.full_name?.charAt(0) || 'U').toUpperCase()
          )}
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {profile?.full_name || 'Anonymous Academic User'}
              </h2>
              {profile?.verified_academic && (
                <CheckCircle size={18} className="text-indigo-600 fill-indigo-100 shrink-0" />
              )}
            </div>

            {/* Action Area Component Layer */}
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              {/* Only show message button if browsing another user's public card */}
              {!isOwnProfile && profile?.id && (
                <button
                  onClick={() => startPrivateChat(profile.id)}
                  disabled={isInitializing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-2xs transition-all disabled:opacity-50"
                >
                  {isInitializing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={11} className="rotate-45 -translate-y-0.5" />
                  )}
                  <span>Message Peer</span>
                </button>
              )}

              <div className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${badgeConfig.bg}`}>
                {badgeConfig.icon}
                <span>{currentRole}</span>
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-indigo-600">@{profile?.username || 'user_node'}</p>
          <p className="text-xs text-gray-400 font-medium">{email}</p>

          <div className="flex justify-center sm:justify-start gap-4 py-1 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><Users size={14} className="text-gray-400" /> <b>{stats.follower_count}</b> followers</span>
            <span><b>{stats.following_count}</b> following</span>
          </div>

          <div className="pt-2 w-full">
            {isEditingBio ? (
              <div className="space-y-2 max-w-xl">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Tell your academic peers about your study vectors..."
                  maxLength={220}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 resize-none font-medium"
                  rows={3}
                />
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setIsEditingBio(false)} className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={handleSaveBio} disabled={isSaving} className="px-3 py-1 text-[11px] bg-indigo-600 text-white font-semibold rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition-all">
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group max-w-xl justify-center sm:justify-start">
                <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                  {profile?.bio || '"No bio configured yet. Share your study courses or active focus lines."'}
                </p>
                {isOwnProfile && (
                  <button type="button" onClick={() => setIsEditingBio(true)} className="p-1 text-gray-300 hover:text-gray-500 transition-colors rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100" title="Edit bio">
                    <Edit3 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}