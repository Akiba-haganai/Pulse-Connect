import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export interface NotificationItem {
  id: string;
  type: "message" | "reply";
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        type,
        message_preview,
        is_read,
        created_at,
        source_id,
        profiles:notifier_id (username, full_name)
      `)
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchNotifications error:", error.message);
      return;
    }

    // ✅ Normalize: profiles is an array, take first element or null
    const normalized = (data || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      message_preview: item.message_preview,
      is_read: item.is_read,
      created_at: item.created_at,
      source_id: item.source_id,
      profiles: item.profiles?.[0] ?? null,
    })) as NotificationItem[];

    setNotifications(normalized);
    setUnreadCount(normalized.filter((n) => !n.is_read).length);
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("receiver_id", user.id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }
  }, [user?.id, unreadCount]);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel(`global_alerts:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newRow = payload.new as any;

          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", newRow.notifier_id)
            .single(); // ✅ returns object, not array

          const senderName = sender?.username
            ? `@${sender.username}`
            : sender?.full_name ?? "Someone";

          const title =
            newRow.type === "message"
              ? "📩 New DM Received"
              : "💬 Thread Reply";

          toast(`${title}\n${senderName}: "${newRow.message_preview}"`, {
            icon: newRow.type === "message" ? "📩" : "💬",
            duration: 4000,
          });

          setUnreadCount((c) => c + 1);
          setNotifications((prev) => [
            {
              id: newRow.id,
              type: newRow.type,
              message_preview: newRow.message_preview,
              is_read: newRow.is_read,
              created_at: newRow.created_at,
              source_id: newRow.source_id,
              profiles: sender || null, // ✅ already object or null
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}