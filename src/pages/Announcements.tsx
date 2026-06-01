import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Megaphone, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Announcements() {
  const { user, profile } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // 🌟 PERMISSION UPGRADE: Both administrators and verified professors can broadcast notices
  const hasPostingPrivileges = profile?.role === 'admin' || profile?.role === 'professor';

  const fetchAnnouncements = async () => {
    try {
      // Retaining your explicit foreign key join matching 'created_by'
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles:created_by (full_name, username, role)
        `)
        .order('created_at', { ascending: false });

      if (data) setAnnouncements(data);
      if (error) console.error("Error fetching announcements:", error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Listen for realtime updates so students see news instantly
    const subscription = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' }, 
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    setIsPosting(true);
    
    const { error } = await supabase.from('announcements').insert([
      { 
        title: title.trim(), 
        content: content.trim(), 
        created_by: user.id 
      }
    ]);

    if (error) {
      toast.error('Failed to post. Check your access permissions.');
      console.error(error);
    } else {
      setTitle('');
      setContent('');
      toast.success('Announcement published!');
    }
    
    setIsPosting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Megaphone size={22} /> Campus Bulletin
        </h2>
        <p className="text-indigo-100 text-xs mt-0.5">Official updates and verified news</p>
      </div>

      {/* 🛡️ Faculty & Admin Only: Create Announcement Form */}
      {hasPostingPrivileges && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xs border border-indigo-100 dark:border-indigo-950/40">
          <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 pb-2 border-b border-gray-50 dark:border-gray-800">
            Post New Announcement ({profile?.role})
          </h3>
          <form onSubmit={handlePost} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement Title..."
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 font-semibold"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write official message guidelines here..."
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPosting || !title.trim() || !content.trim()}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {isPosting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Feed Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-medium">
            No official announcements right now.
          </div>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-3xs space-y-2"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{announcement.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
              
              <div className="pt-2.5 mt-2 border-t border-gray-50 dark:border-gray-800/60 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500">
                <span>
                  By <strong className="text-gray-700 dark:text-gray-300 font-bold">{announcement.profiles?.full_name || 'Verified Staff'}</strong>
                  {announcement.profiles?.role && (
                    <span className="ml-1.5 px-1 py-0.2 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[8px] font-extrabold uppercase tracking-wide rounded-sm">
                      {announcement.profiles.role}
                    </span>
                  )}
                </span>
                <span>
                  {new Date(announcement.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}