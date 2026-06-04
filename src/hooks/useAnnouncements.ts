import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "academic" | "event" | "urgent";
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
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          id, title, content, category, created_at,
          profiles (full_name, role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ✅ FIX: Normalize the profiles array to a single object or null
      const normalized = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles?.[0] ?? null
      })) as Announcement[];

      setAnnouncements(normalized);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (
    title: string,
    content: string,
    category: "academic" | "event" | "urgent"
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const { error } = await supabase.from("announcements").insert([
        { user_id: user.id, title, content, category }
      ]);

      if (error) throw error;

      toast.success("Official announcement broadcasted!");
      await fetchAnnouncements(); // Refresh after creation
      return true;
    } catch (err) {
      toast.error("Failed to post announcement.");
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("realtime:announcements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    announcements,
    loading,
    createAnnouncement,
    refresh: fetchAnnouncements,
  };
}