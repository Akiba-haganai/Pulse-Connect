import { useEffect, useState } from 'react';
// 🛠️ PATH FIXES: Stepping up two levels to correctly hit src/ root files
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore'; 
// 🛠️ VERBATIM COMPILER FIX: Explicitly enforce type imports
import type { NotificationItem } from '../types/notification'; 

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (ids: string[]) => {
    if (!ids.length) return;

    setNotifications((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, is_read: true } : n
      )
    );

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // 🛠️ REALTIME OPTIMIZATION: Filter directly inside the channel setup. 
    // This stops you from receiving random notification packets meant for other logged-in users!
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` 
        },
        (payload: any) => {
          const event = payload.eventType;

          if (event === 'INSERT') {
            setNotifications((prev) => [
              payload.new as NotificationItem,
              ...prev,
            ]);
          }

          if (event === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as NotificationItem) : n
              )
            );
          }

          if (event === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old?.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { notifications, loading, markAsRead };
}