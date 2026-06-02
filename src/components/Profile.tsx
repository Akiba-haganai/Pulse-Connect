import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User, BookOpen, MessageCircle, Info, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const CBU_SCHOOLS = [
  'School of Technology',
  'School of Business',
  'School of Engineering',
  'School of Mines and Mineral Sciences',
  'School of Mathematics and Natural Sciences',
  'School of Built Environment',
  'School of Medicine',
  'Other'
];

export default function Profile() {
  const { user, profile } = useAuthStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    school: '',
    whatsapp_number: ''
  });

  // Load existing profile data into the form when the component mounts
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        school: (profile as any).school || '',
        whatsapp_number: (profile as any).whatsapp_number || ''
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    // Clean up the WhatsApp number (strip spaces, ensure it has the country code)
    let cleanedWhatsApp = formData.whatsapp_number.replace(/\s+/g, '');
    if (cleanedWhatsApp && !cleanedWhatsApp.startsWith('+')) {
      // Default to Zambia code if they just type 097...
      cleanedWhatsApp = cleanedWhatsApp.startsWith('0') 
        ? `+260${cleanedWhatsApp.substring(1)}` 
        : `+260${cleanedWhatsApp}`;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        school: formData.school,
        whatsapp_number: cleanedWhatsApp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile.');
      console.error(error);
    } else {
      toast.success('Profile synced successfully!');
      // Update local state to reflect formatting
      setFormData(prev => ({ ...prev, whatsapp_number: cleanedWhatsApp }));
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-md mx-auto px-2 pb-24 space-y-4 font-sans text-left">
      
      {/* Header Card */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10">
          <User size={120} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 flex items-center justify-center text-2xl font-black shadow-inner">
            {formData.username?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{formData.full_name || 'Student Profile'}</h2>
            <p className="text-indigo-200 text-xs font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck size={12} /> Verified Campus Account
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl p-5 shadow-2xs space-y-5">
        
        {/* Core Identity */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-900 pb-2">Identity Details</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. tech_ninja"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                placeholder="Real name"
              />
            </div>
          </div>
        </div>

        {/* Campus Info */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-900 pb-2">Campus Profile</h3>
          
          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <BookOpen size={12} className="text-indigo-500" /> Academic School
            </label>
            <select
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              <option value="">Select your faculty...</option>
              {CBU_SCHOOLS.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Info size={12} className="text-indigo-500" /> Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full resize-none bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="What are you studying? What are your interests?"
            />
          </div>
        </div>

        {/* Marketplace Integrations */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-900 pb-2">Marketplace Links</h3>
          
          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <MessageCircle size={12} className="text-green-500" /> WhatsApp Number
            </label>
            <input
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors"
              placeholder="+260 97X XXX XXX"
            />
            <p className="text-[9px] text-gray-400 mt-1.5 font-medium">
              Used strictly for 1-click WhatsApp buttons on your marketplace listings.
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
          >
            <Save size={16} />
            {isSaving ? 'Syncing...' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}