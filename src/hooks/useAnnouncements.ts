import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'event' | 'urgent';
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
  } | null;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id, title, content, category, created_at,
          profiles (full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data as unknown as Announcement[]);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (title: string, content: string, category: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const { error } = await supabase.from('announcements').insert([
        { user_id: user.id, title, content, category }
      ]);

      if (error) throw error;
      toast.success('Official announcement broadcasted!');
      return true;
    } catch (err) {
      toast.error('Unauthorized: Only faculty accounts can post announcements.');
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel('realtime:announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => { fetchAnnouncements(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { announcements, loading, createAnnouncement, refresh: fetchAnnouncements };
}