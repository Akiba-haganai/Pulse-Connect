import { supabase } from '../lib/supabase';
import { useCachedData } from './useCachedData';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useCampusLocations() {
  const fetcher = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*, location_services(*), location_documents(*)')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const { data: locations, loading } = useCachedData(
    { key: 'cbu_campus_directory', ttl: ONE_DAY_MS },
    fetcher
  );

  return { locations: locations || [], loading };
}