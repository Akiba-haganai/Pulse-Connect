import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePostCooldown(userId: string | undefined) {
  const [postsThisHour, setPostsThisHour] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const MAX_POSTS_PER_HOUR = 6;

  // 1. Fetch recent timestamps from Supabase
  const checkLimits = useCallback(async () => {
    if (!userId) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('posts') // Adjust table name here if it's 'home_posts'
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const timestamps = data.map((p) => p.created_at);
      setPostsThisHour(timestamps);
    }
  }, [userId]);

  // Run limit check on mount or when user changes
  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  // 2. Local countdown ticking mechanics
  useEffect(() => {
    if (postsThisHour.length < MAX_POSTS_PER_HOUR) {
      setSecondsLeft(0);
      return;
    }

    const calculateTimeRemaining = () => {
      // Find the absolute oldest post timestamp out of our 6 limit nodes
      const oldestPostTime = new Date(postsThisHour[0]).getTime();
      const recoveryTargetTime = oldestPostTime + 60 * 60 * 1000; // +1 hour
      const remainingMs = recoveryTargetTime - Date.now();

      return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
    };

    // Set initial countdown tick
    setSecondsLeft(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        checkLimits(); // Refresh our tokens from database context
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [postsThisHour, checkLimits]);

  const tokensRemaining = Math.max(0, MAX_POSTS_PER_HOUR - postsThisHour.length);

  return {
    isThrottled: tokensRemaining === 0 && secondsLeft > 0,
    tokensRemaining,
    secondsLeft,
    maxTokens: MAX_POSTS_PER_HOUR,
    refreshLimits: checkLimits,
  };
}