import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { BarChart3, TrendingUp, HardDrive, ShieldAlert, ArrowLeft, Download, FileText, School, Loader2 } from 'lucide-react';
import MapModerationPanel from './AdminMapPanel'; 

interface TopDownloadItem {
  resource_type: string;
  resource_id: string;
  title: string;
  school_name: string;
  download_count: number;
}

interface SchoolDistributionItem {
  school_name: string;
  total_resources: number;
  aggregate_downloads: number;
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [topDownloads, setTopDownloads] = useState<TopDownloadItem[]>([]);
  const [schoolStats, setSchoolStats] = useState<SchoolDistributionItem[]>([]);
  const [systemOverview, setSystemOverview] = useState({ totalFiles: 0, totalDownloads: 0, recentHits: 0 });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'professor';
  
  useEffect(() => {
    if (isAdmin) {
      fetchAnalyticsData();
    }
  }, [isAdmin]);

  async function fetchAnalyticsData() {
    try {
      setLoading(true);

      // Fetch dynamic analytics from database views
      const [topRes, schoolRes, totalDocsRes, totalPapersRes, logsCountRes] = await Promise.all([
        supabase.from('view_admin_top_downloads').select('*'),
        supabase.from('view_admin_school_distribution').select('*'),
        supabase.from('documents').select('download_count', { count: 'exact' }),
        supabase.from('past_papers').select('download_count', { count: 'exact' }),
        supabase.from('download_logs').select('*', { count: 'exact', head: true })
      ]);

      // Calculate systemic totals
      const docsCount = totalDocsRes.count || 0;
      const papersCount = totalPapersRes.count || 0;
      
      const docsDownloads = totalDocsRes.data?.reduce((acc, curr) => acc + (curr.download_count || 0), 0) || 0;
      const papersDownloads = totalPapersRes.data?.reduce((acc, curr) => acc + (curr.download_count || 0), 0) || 0;

      setTopDownloads(topRes.data || []);
      setSchoolStats(schoolRes.data || []);
      setSystemOverview({
        totalFiles: docsCount + papersCount,
        totalDownloads: docsDownloads + papersDownloads,
        recentHits: logsCountRes.count || 0
      });
    } catch (error) {
      console.error('Failed processing administrative records stream:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-red-200 p-6 rounded-2xl max-w-md text-center shadow-xs">
          <ShieldAlert className="mx-auto text-red-500 mb-3" size={44} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Your profile role credentials do not possess the clearance metrics required to access telemetry logging views.</p>
          <button onClick={onBack} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl text-xs font-semibold transition-all">Return to Node</button>
        </div>
      </div>
    );
  }

  const maxDownloads = Math.max(...schoolStats.map(s => s.aggregate_downloads), 1);

  return (
    <div className="space-y-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          
          {/* Admin Header Context Dashboard */}
          <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all" aria-label="Return to index view">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <BarChart3 className="text-indigo-600" size={22} /> Metrics Analytics Dashboard
                </h1>
                <p className="text-xs text-gray-400">Systemic index distributions & content interaction telemetry</p>
              </div>
            </div>
            <button onClick={fetchAnalyticsData} className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl hover:bg-gray-50">
              Refresh Stream
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
          ) : (
            <>
              {/* Top Stat Matrix Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-gray-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Indexed Nodes</span>
                    <HardDrive size={16} className="text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.totalFiles}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Total active items hosted on Pulse storage buckets</p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-gray-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Gross Downloads</span>
                    <Download size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.totalDownloads}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Total click executions tracked via runtime wrappers</p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-gray-400 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Telemetry Events Logged</span>
                    <TrendingUp size={16} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.recentHits}</div>
                  <p className="text-[10px] text-gray-400 mt-1">Total logged interactions inside history tables</p>
                </div>
              </div>

              {/* Split Data Distribution Architecture Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: School Traffic Metrics Distribution */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Institutional Directory Traffic</h3>
                    <p className="text-[11px] text-gray-400">Comparing total cataloged rows against request weights</p>
                  </div>
                  
                  <div className="space-y-3.5">
                    {schoolStats.map((school, idx) => {
                      const percentage = Math.min((school.aggregate_downloads / maxDownloads) * 100, 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="truncate max-w-65 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                              <School size={12} className="text-gray-400" /> {school.school_name}
                            </span>
                            <span className="text-gray-400 shrink-0 text-[11px]">
                              {school.total_resources} files • <strong className="text-gray-700 dark:text-gray-200">{school.aggregate_downloads} hits</strong>
                            </span>
                          </div>
                          {/* CSS Progress Bar Chart Element */}
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Trending Resource Leaderboard List */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Most In-Demand Resources</h3>
                    <p className="text-[11px] text-gray-400">Top 5 educational elements categorized across search logs</p>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topDownloads.map((item, index) => (
                      <div key={item.resource_id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="text-xs font-bold text-gray-400 w-4 pt-1">{index + 1}</div>
                          <div className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg shrink-0">
                            {item.resource_type === 'document' ? <FileText size={14} /> : <School size={14} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate" title={item.title}>
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate">{item.school_name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-md">
                            {item.download_count} downloads
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Map Moderation Panel */}
      <MapModerationPanel />
    </div>
  );
}