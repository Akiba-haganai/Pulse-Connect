import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, TrendingUp } from 'lucide-react';

export default function PopularCourses() {
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPopularCourses() {
      const { data } = await supabase
        .from('past_papers')
        .select('course_code, download_count')
        .order('download_count', { ascending: false })
        .limit(4);
      
      // Reduce schema down to distinct tracking groups
      if (data) {
        const unique = data.filter((v, i, a) => a.findIndex(t => t.course_code === v.course_code) === i);
        setTopCourses(unique);
      }
    }
    fetchPopularCourses();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <TrendingUp size={16} className="text-emerald-500" />
        <h2 className="text-base font-bold tracking-tight">Trending Course Handbooks</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topCourses.length === 0 ? (
          ['COS101', 'BIT211', 'EEE302', 'BBA112'].map((dummy) => (
            <div key={dummy} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 p-3 rounded-xl flex items-center gap-2 opacity-50">
              <div className="text-[11px] font-bold tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">{dummy}</div>
              <span className="text-[10px] text-gray-400">0 requests</span>
            </div>
          ))
        ) : (
          topCourses.map((c) => (
            <div key={c.course_code} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl flex items-center justify-between hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-md"><Award size={14} /></div>
                <span className="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300 truncate">{c.course_code}</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md shrink-0">
                {c.download_count || 0} dl
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}