import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string | null; // TypeScript now explicitly recognizes this column layout!
  profiles?: {
    username: string | null;
    avatar_url: string | null;
    full_name: string | null;
  } | null;
};

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    // Grabbing all core columns via '*' automatically includes parent_id,
    // plus the joined relation object mappings for user profiles
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (username, avatar_url, full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed syncing global stream arrays:", error);
      return;
    }

    if (data) {
      setPosts(data as unknown as Post[]);
    }
  };

  useEffect(() => {
    // 1. Fetch initial posts on load
    fetchPosts();

    // 2. Subscribe to REALTIME database changes
    const subscription = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          // Whenever a new post is inserted into the DB, refresh the feed!
          fetchPosts();
        }
      )
      .subscribe();

    // 3. Cleanup the subscription when the user leaves the page
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { posts, setPosts, refresh: fetchPosts };
}