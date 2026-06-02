import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Clock, Flame} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePosts } from '../hooks/usePosts';
import { usePostCooldown } from '../hooks/usePostCooldown';
import PostReplies from './home/PostReplies';

export default function Home() {
  const { user, profile } = useAuthStore();
  const { posts, refresh } = usePosts();
  
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);

  const { isThrottled, tokensRemaining, secondsLeft, maxTokens, refreshLimits } = usePostCooldown(user?.id);

  const toggleReplies = (postId: string) => {
    setExpandedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user || isThrottled) return;

    setIsPosting(true);
    const { error } = await supabase.from('posts').insert([
      { user_id: user.id, content: newPost.trim() }
    ]);

    if (error) {
      toast.error('Failed to broadcast post node');
    } else {
      setNewPost('');
      toast.success('Broadcast complete!');
      refresh();
      refreshLimits();
    }
    setIsPosting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percentageCooldown = isThrottled ? ((3600 - secondsLeft) / 3600) * 100 : 100;
  const roundedProgress = Math.min(100, Math.max(0, Math.round(percentageCooldown / 5) * 5));
  
  const progressWidthClasses: Record<number, string> = {
    0: 'w-[0%]', 5: 'w-[5%]', 10: 'w-[10%]', 15: 'w-[15%]', 20: 'w-[20%]', 25: 'w-[25%]',
    30: 'w-[30%]', 35: 'w-[35%]', 40: 'w-[40%]', 45: 'w-[45%]', 50: 'w-[50%]', 55: 'w-[55%]',
    60: 'w-[60%]', 65: 'w-[65%]', 70: 'w-[70%]', 75: 'w-[75%]', 80: 'w-[80%]', 85: 'w-[85%]',
    90: 'w-[90%]', 95: 'w-[95%]', 100: 'w-[100%]'
  };
  const progressWidthClass = progressWidthClasses[roundedProgress];

  return (
    <div className="space-y-4 max-w-md mx-auto px-2 pb-24 text-left font-sans">
      
      {/* COMPOSER CARD: Reddit-Inspired Compact Composer Frame */}
      <div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl p-4 shadow-2xs transition-all">
        <form onSubmit={handlePost}>
          {isThrottled ? (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full animate-pulse">
                <Clock size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Broadcast Channel Cooldown</h4>
                <p className="text-[10px] text-gray-400 font-medium max-w-70 leading-normal">
                  To prevent feed spam, posts are limited. Your next token ready in:
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-1">
                <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                  <div className={`bg-indigo-600 h-full transition-all duration-1000 ease-linear ${progressWidthClass}`} />
                </div>
                <div className="flex justify-between text-[9px] font-black text-indigo-500 tracking-widest">
                  <span>REFRESHING METRICS</span>
                  <span>{formatTime(secondsLeft)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-start">
              {/* Left Channel Indicator Profile Bubble */}
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                {profile?.username?.charAt(0).toUpperCase() || 'P'}
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening on campus? Drop a link or update..."
                disabled={isPosting}
                className="w-full resize-none outline-none text-sm font-semibold text-gray-700 dark:text-gray-200 placeholder-gray-400 bg-transparent py-1 leading-relaxed"
                rows={2}
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-900/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400">
                Posting as <span className="text-indigo-500">@{profile?.username || 'student'}</span>
              </span>
              <div className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border ${
                isThrottled 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100/30' 
                  : 'bg-gray-50 dark:bg-gray-950 text-gray-400 border-gray-100 dark:border-gray-900'
              }`}>
                {tokensRemaining}/{maxTokens} TKNS
              </div>
            </div>

            {!isThrottled && (
              <button
                type="submit"
                disabled={isPosting || !newPost.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95 shadow-xs"
              >
                <Send size={11} />
                <span>{isPosting ? 'Posting' : 'Share'}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RE-ARCHITECTED STREAM FEED FRAME */}
      <div className="space-y-2.5">
        {posts
          .filter((post) => !post.parent_id)
          .map((post) => {
            const showReplies = expandedPostIds.includes(post.id);

            return (
              <div 
                key={post.id} 
                className="bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-gray-200 dark:hover:border-gray-800"
              >
                {/* Dynamic Dual Horizontal Split (Reddit Signature Layout Strategy) */}
                <div className="flex">
                  
                  {/* LEFT CHANNEL: Geometric Subtle Interaction Hub */}
                  <div className="w-11 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col items-center pt-4 border-r border-gray-50 dark:border-gray-900/40 select-none">
                    <div className="p-1 rounded-lg text-gray-300 dark:text-gray-700 hover:text-orange-500 transition-colors cursor-pointer">
                      <Flame size={15} className="fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 my-1">
                      {new Date(post.created_at).getDate()}
                    </span>
                  </div>

                  {/* RIGHT CHANNEL: Dense Metadata and Typography Frame */}
                  <div className="flex-1 p-4 space-y-2">
                    
                    {/* Header Row Meta Alignment */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-black text-gray-900 dark:text-white hover:underline cursor-pointer">
                        p/{post.profiles?.username || 'anonymous'}
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-gray-400 font-medium">
                        {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Core Body Payload Text Context */}
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pr-1">
                      {post.content}
                    </p>

                    {/* Integrated Foot Actions Panel Row */}
                    <div className="pt-2 flex items-center gap-4 border-t border-gray-50 dark:border-gray-900/40">
                      <button 
                        onClick={() => toggleReplies(post.id)}
                        className={`flex items-center gap-1.5 text-[11px] font-black transition-colors px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-950/60 ${
                          showReplies 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <MessageSquare size={12} />
                        <span>{showReplies ? 'Hide Discussions' : 'Discuss'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Sub-tray Thread Collapse Block */}
                {showReplies && (
                  <div className="bg-gray-50/40 dark:bg-gray-950/10 border-t border-gray-100 dark:border-gray-900 p-3 pl-6 relative">
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-800" />
                    <PostReplies postId={post.id} />
                  </div>
                )}

              </div>
            );
          })}
        
        {posts.filter((post) => !post.parent_id).length === 0 && (
          <div className="text-center text-xs font-bold text-gray-400 py-12 border border-dashed border-gray-200 dark:border-gray-900 rounded-2xl bg-white dark:bg-black">
            No active broadcast streams running.
          </div>
        )}
      </div>
    </div>
  );
}