import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Define the shape of our profile data explicitly
interface ProfileFormData {
  username: string;
  full_name: string;
  bio: string;
  school: string;
  whatsapp_number: string;
}


export default function Profile() {
  const { user, profile } = useAuthStore();
  const [_isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '', full_name: '', bio: '', school: '', whatsapp_number: ''
  });

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

  const _handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    let cleaned = formData.whatsapp_number.replace(/\s+/g, '');
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = cleaned.startsWith('0') ? `+260${cleaned.substring(1)}` : `+260${cleaned}`;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        whatsapp_number: cleaned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile synced!');
      setFormData(prev => ({ ...prev, whatsapp_number: cleaned }));
    }
    setIsSaving(false);
  };

  void _handleSave;

  // ... (Keep your JSX return structure as it was, it is solid)
}