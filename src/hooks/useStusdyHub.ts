import { supabase } from '../lib/supabase';
import { useCachedData } from './useCachedData';

const FIFTEEN_MINS_MS = 15 * 60 * 1000;

export function useStudyHub(activeCourseCode?: string) {
  const fetcher = async () => {
    let query = supabase.from('study_resources').select('*, academic_courses(title)');
    
    if (activeCourseCode) {
      query = query.eq('course_code', activeCourseCode.toUpperCase().replace(/\s+/g, ''));
    }
    
    const { data, error } = query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  // Unique cache key per course code prevents data cross-contamination
  const cacheKey = `study_hub_${activeCourseCode || 'global'}`;

  const { data: resources, loading } = useCachedData(
    { key: cacheKey, ttl: FIFTEEN_MINS_MS },
    fetcher
  );

  return { resources: resources || [], loading };
}