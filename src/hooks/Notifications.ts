import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Helper to get only unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50); // Keep it to the most recent 50

    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications(); // Refresh local state
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Listen ONLY for notifications directed at the logged-in user
    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` // Crucial: only listen to THEIR notifications
        },
        (payload) => {
          // Play a sound, show a toast, and update the list!
          toast("New Notification: " + payload.new.message, { icon: '🔔' });
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { notifications, unreadCount, markAsRead };
}