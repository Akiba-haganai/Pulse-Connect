import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { ProfileStats } from '../../../types/profile';

export function useProfileStats(profileId: string | undefined) {
  const [stats, setStats] = useState<ProfileStats>({
    total_uploads: 0,
    total_accrued_downloads: 0,
    follower_count: 0,
    following_count: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_profile_analytics', {
        target_user_id: profileId
      });

      if (rpcError) throw rpcError;

      if (data && data[0]) {
        setStats({
          total_uploads: Number(data[0].total_uploads || 0),
          total_accrued_downloads: Number(data[0].total_accrued_downloads || 0),
          follower_count: Number(data[0].follower_count || 0),
          following_count: Number(data[0].following_count || 0)
        });
      }
    } catch (err: any) {
      console.error('Stats fetch failure:', err);
      setError(err.message || 'Failed to aggregate runtime analytics profile data.');
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}