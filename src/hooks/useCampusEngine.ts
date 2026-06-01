import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'event' | 'urgent';
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    role: string;
  } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  sender_name: string;
  title: string;
  content: string;
  category: 'announcement' | 'chat';
  is_read: boolean;
  created_at: string;
}

export function useCampusEngine() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 📥 Fetch historical announcements and your target user_id notifications
  const syncDataMatrix = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [announcementsRes, notificationsRes] = await Promise.all([
        supabase
          .from('announcements')
          .select('*, profiles:created_by(full_name, role)')
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id) // Using the patched user_id column
          .order('created_at', { ascending: false })
      ]);

      if (announcementsRes.data) setAnnouncements(announcementsRes.data as unknown as Announcement[]);
      if (notificationsRes.data) setNotifications(notificationsRes.data as Notification[]);
    } catch (err) {
      console.error('System synchronization breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📢 Faculty Broadcast Publisher + Storage File Stream Upload Engine
  const publishBroadcast = async (
    title: string, 
    content: string, 
    category: string, 
    attachedFile: File | null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let file_url = null;
      let file_name = null;

      // If a physical file asset exists, push it up into your cloud bucket space
      if (attachedFile) {
        file_name = attachedFile.name;
        const fileExt = attachedFile.name.split('.').pop();
        const storagePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('academic-vault')
          .upload(storagePath, attachedFile);

        if (uploadError) throw uploadError;

        // Extract the clean public static link address
        const { data } = supabase.storage.from('academic-vault').getPublicUrl(storagePath);
        file_url = data.publicUrl;
      }

      // Record the text data row catalog trace entry into the database
      const { error: insertError } = await supabase.from('announcements').insert([
        { 
          created_by: user.id, 
          title, 
          content, 
          category, 
          file_url, 
          file_name 
        }
      ]);

      if (insertError) throw insertError;
      toast.success('Official alert broadcasted to institution!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Transmission failed.');
      return false;
    }
  };

  // 🔔 Read status toggler function
  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);
      
    if (!error) {
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
      );
    }
  };

  // ⚡ THE REAL-TIME NOTIFICATION LOOP CONNECTION HANDLER
  useEffect(() => {
    syncDataMatrix();

    const channel = supabase
      .channel('campus_realtime_stream')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' }, 
        () => { syncDataMatrix(); }
      )
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => { syncDataMatrix(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { announcements, notifications, loading, publishBroadcast, markAsRead, refresh: syncDataMatrix };
}