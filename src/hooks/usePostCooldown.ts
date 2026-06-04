import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const MAX_POSTS_PER_HOUR = 6;

export function usePostCooldown(userId?: string) {
  const [postTimes, setPostTimes] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const checkLimits = useCallback(async () => {
    if (!userId) return;

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (error) {
      console.error("cooldown fetch error:", error.message);
      return;
    }

    const timestamps =
      data?.map((p) => new Date(p.created_at).getTime()) || [];

    setPostTimes(timestamps.sort((a, b) => a - b));
  }, [userId]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (postTimes.length < MAX_POSTS_PER_HOUR) {
        setSecondsLeft(0);
        return;
      }

      const oldest = postTimes[0];
      const resetTime = oldest + 3600000;
      const remaining = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));

      setSecondsLeft(remaining);

      if (remaining === 0) {
        checkLimits();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [postTimes, checkLimits]);

  return {
    isThrottled:
      postTimes.length >= MAX_POSTS_PER_HOUR && secondsLeft > 0,
    tokensRemaining: Math.max(
      0,
      MAX_POSTS_PER_HOUR - postTimes.length
    ),
    secondsLeft,
    maxTokens: MAX_POSTS_PER_HOUR,
    refreshLimits: checkLimits,
  };
}