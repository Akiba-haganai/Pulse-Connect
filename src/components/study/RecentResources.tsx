import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, ArrowUpRight } from 'lucide-react';

export default function RecentResources() {
  const [recents, setRecents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentData() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, title, created_at, schools(name)')
          .order('created_at', { ascending: false })
          .limit(3);
        if (!error) setRecents(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentData();
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Clock size={16} className="text-indigo-500" />
        <h2 className="text-base font-bold tracking-tight">Recent Activity Feeds</h2>
      </div>

      {loading ? (
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      ) : recents.length === 0 ? (
        <p className="text-xs text-gray-400">No telemetry indexes captured over active network channels.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recents.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between group hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                  <p className="text-[10px] text-indigo-500 font-medium truncate">{item.schools?.name || 'General'}</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-gray-400 group-hover:text-indigo-500 transition-colors ml-2 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}