import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';

export function usePeerSearch() {
  const [peers, setPeers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      // Apply text search filter if typed string exists
      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      // Apply structural role filter tags
      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole);
      }

      const { data, error } = await query.limit(24);

      if (error) throw error;
      setPeers(data || []);
    } catch (err) {
      console.error('Failed processing peer search vectors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRole]);

  // Debounce or trigger search whenever dependencies change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      executeSearch();
    }, 250); // 250ms delay to prevent hammering database on every single keystroke

    return () => clearTimeout(delayDebounce);
  }, [executeSearch]);

  return {
    peers,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    isLoading,
    refetchPeers: executeSearch
  };
}