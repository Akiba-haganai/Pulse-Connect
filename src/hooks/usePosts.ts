import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Post } from "../types/post";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);

    try {
      // Fetch posts without join first
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, user_id, content, created_at, parent_id")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      console.log("Posts fetched successfully:", postsData);

      // Fetch unique user profiles
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Create a map of user_id -> profile
        const profileMap: Record<string, any> = {};
        (profilesData ?? []).forEach((profile: any) => {
          profileMap[profile.id] = profile;
        });

        // Attach profiles to posts
        const normalized = (postsData ?? []).map((post: any) => ({
          ...post,
          profiles: profileMap[post.user_id] ?? null,
        }));

        console.log("Normalized posts:", normalized);
        setPosts(normalized);
      } else {
        setPosts([]);
      }
      setError(null);
    } catch (error) {
      console.error("Failed to load posts:", error);
      let errorMsg = "Unknown error";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMsg = JSON.stringify(error);
      } else {
        errorMsg = String(error);
      }
      console.error("Error details:", errorMsg);
      setError(errorMsg);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    refresh: fetchPosts,
  };
}