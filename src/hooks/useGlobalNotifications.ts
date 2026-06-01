import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface NotificationItem {
  id: string;
  type: 'message' | 'reply';
  message_preview: string;
  is_read: boolean;
  created_at: string;
  source_id: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

export function useGlobalNotifications() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id, type, message_preview, is_read, created_at, source_id,
        profiles:notifier_id (username, full_name)
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as unknown as NotificationItem[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('receiver_id', user.id);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Open up a live channel to listen to changes on the notifications table
    const channel = supabase
      .channel(`global_alerts:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          // Fetch sender profile information to make the alert human-readable
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', payload.new.notifier_id)
            .single();

          // Construct user-friendly alert metadata
          const title = payload.new.type === 'message' ? '📩 New DM Received' : '💬 Thread Reply';
          const senderName = sender?.full_name || `@${sender?.username}` || 'Someone';
          
          // Display an immediate, interactive popup alert via react-hot-toast
          toast(`${title}\n${senderName}: "${payload.new.message_preview}"`, {
            icon: payload.new.type === 'message' ? '📩' : '💬',
            duration: 4000
          });

          // Update local component state records on the fly
          setUnreadCount(c => c + 1);
          setNotifications(prev => [
            {
              id: payload.new.id,
              type: payload.new.type,
              message_preview: payload.new.message_preview,
              is_read: payload.new.is_read,
              created_at: payload.new.created_at,
              source_id: payload.new.source_id,
              profiles: sender
            },
            ...prev
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { notifications, unreadCount, markAllAsRead, refreshNotifications: fetchNotifications };
}