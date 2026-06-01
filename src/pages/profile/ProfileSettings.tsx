import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { User, AtSign, Image, Loader2 } from 'lucide-react';
import type { Profile } from '../../types/profile';

interface SettingsProps {
  profile: Profile | null;
}

export default function ProfileSettings({ profile }: SettingsProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    if (username.trim().length < 3) {
      return toast.error('Username handles must contain at least 3 characters.');
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          avatar_url: avatarUrl.trim(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Workspace profile settings committed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Database execution rejected update payload.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Workspace Preferences</h3>
        <p className="text-[11px] text-gray-400 font-medium">Configure your forward-facing meta parameters and routing names</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <User size={12} /> Full Professional Identity Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            placeholder="e.g., Jonathan Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <AtSign size={12} /> Custom Handle Routing Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            placeholder="johndoe_node"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Image size={12} /> Avatar Source Network URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full p-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            placeholder="https://images.unsplash.com/your-photo"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
        >
          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>Synchronize Profile Identity</span>
        </button>
      </form>
    </div>
  );
}