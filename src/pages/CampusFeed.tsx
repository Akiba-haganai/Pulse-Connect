import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCampusEngine } from '../hooks/useCampusEngine';
import { Megaphone, FileText, Download, Send, Paperclip, ShieldAlert, Calendar, BookOpen, Loader2 } from 'lucide-react';

export default function CampusFeed() {
  const profile = useAuthStore((state) => state.profile);
  const { announcements, publishBroadcast, loading } = useCampusEngine();

  // Form Submission Parameters
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'academic' | 'event' | 'urgent'>('academic');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isFaculty = profile?.role === 'professor' || profile?.role === 'admin';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const completed = await publishBroadcast(title.trim(), content.trim(), category, file);
    if (completed) {
      setTitle('');
      setContent('');
      setCategory('academic');
      setFile(null);
    }
    setSubmitting(false);
  };

  const getBadgeColors = (cat: string) => {
    switch (cat) {
      case 'urgent': return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
      case 'event': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      default: return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 space-y-4 pb-20">
      
      {/* 🛡️ 1. FACULTY ANNOUNCEMENT BROADCAST CHANNEL FORM */}
      {isFaculty && (
        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/40 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Megaphone size={16} />
            <h3 className="text-xs font-black uppercase tracking-wider">Faculty Console</h3>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Announcement Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100 font-bold focus:ring-2 focus:ring-indigo-500/20"
              required
            />
            <textarea
              placeholder="Write the official details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-hidden text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              required
            />
          </div>

          {/* 📁 2. DOCUMENT STORAGE ATTACHMENT CONTROLS */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                aria-label="Announcement category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="p-1.5 text-[11px] font-bold bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg outline-hidden"
              >
                <option value="academic">📘 Academic</option>
                <option value="event">📆 Event</option>
                <option value="urgent">🚨 Urgent</option>
              </select>

              <label className="p-1.5 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 transition-colors">
                <Paperclip size={12} />
                <span className="max-w-20 truncate">{file ? file.name : 'Attach file'}</span>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Broadcast
            </button>
          </div>
        </form>
      )}

      {/* 📢 3. OFFICIAL STREAMING BULLETIN VIEW */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Live Campus Feed</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-medium">
            No official bulletins active right now.
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-3xs space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase tracking-wide rounded-md ${getBadgeColors(item.category)}`}>
                    {item.category === 'urgent' && <ShieldAlert size={10} />}
                    {item.category === 'event' && <Calendar size={10} />}
                    {item.category === 'academic' && <BookOpen size={10} />}
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1.5">{item.title}</h4>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.content}</p>

              {/* Secure Cloud Download Rendering Link */}
              {item.file_url && (
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-gray-100 dark:border-gray-800 rounded-xl text-xs text-gray-700 dark:text-gray-300 w-full group transition-colors"
                >
                  <FileText size={14} className="text-indigo-500" />
                  <span className="truncate flex-1 font-semibold text-left text-[11px]">{item.file_name || 'Download Resource Asset'}</span>
                  <Download size={12} className="text-gray-400 group-hover:text-indigo-600 transition-colors mr-1" />
                </a>
              )}

              <div className="pt-2 mt-1 border-t border-gray-50 dark:border-gray-800/60 flex justify-between items-center text-[10px] text-gray-400">
                <span className="font-semibold text-gray-500 dark:text-gray-400">✍️ {item.profiles?.full_name || 'Faculty Member'}</span>
                <span className="bg-gray-50 dark:bg-gray-800 px-1.5 py-0.2 rounded-sm text-[8px] font-extrabold uppercase tracking-wider border border-gray-100 dark:border-gray-700">
                  {item.profiles?.role || 'Staff'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}