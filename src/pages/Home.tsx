import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Clock} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePosts } from '../hooks/usePosts';
import { usePostCooldown } from '../hooks/usePostCooldown';
import PostReplies from './home/PostReplies'; // Import your new reply component!

export default function Home() {
  const { user, profile } = useAuthStore();
  const { posts, refresh } = usePosts();
  
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Track which post comment trays are currently expanded
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);

  // Load our realtime token/rate parameters
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
      refresh();        // Sync post feed component
      refreshLimits();  // Instantly decrement locally tracked token state variables
    }
    setIsPosting(false);
  };

  // Convert seconds remaining to neat mm:ss formatting string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate percentage progress for animated bar calculation
  const percentageCooldown = isThrottled ? ((3600 - secondsLeft) / 3600) * 100 : 100;
  const roundedProgress = Math.min(100, Math.max(0, Math.round(percentageCooldown / 5) * 5));
  const progressWidthClasses: Record<number, string> = {
    0: 'w-[0%]',
    5: 'w-[5%]',
    10: 'w-[10%]',
    15: 'w-[15%]',
    20: 'w-[20%]',
    25: 'w-[25%]',
    30: 'w-[30%]',
    35: 'w-[35%]',
    40: 'w-[40%]',
    45: 'w-[45%]',
    50: 'w-[50%]',
    55: 'w-[55%]',
    60: 'w-[60%]',
    65: 'w-[65%]',
    70: 'w-[70%]',
    75: 'w-[75%]',
    80: 'w-[80%]',
    85: 'w-[85%]',
    90: 'w-[90%]',
    95: 'w-[95%]',
    100: 'w-[100%]'
  };
  const progressWidthClass = progressWidthClasses[roundedProgress];

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 transition-all">
        <form onSubmit={handlePost}>
          {isThrottled ? (
            /* LOCK DOWN VIEW: Replaces textarea completely with premium progress countdown indicator */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full ring-8 ring-amber-50/40 animate-pulse">
                <Clock size={24} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-gray-900">Posting Channel Throttled</h4>
                <p className="text-[11px] text-gray-400 font-medium leading-normal">
                  To keep the campus stream high quality, you can post a max of 6 times per hour. Your next token regenerates in:
                </p>
              </div>
              
              {/* Progress Loading Bar Container */}
              <div className="w-full max-w-xs space-y-1.5">
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-50">
                  <div 
                    className={`bg-indigo-600 h-full transition-all duration-1000 ease-linear rounded-full ${progressWidthClass}`} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-indigo-600 tracking-wide px-0.5">
                  <span>REGENERATING TOKEN</span>
                  <span>{formatTime(secondsLeft)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* OPEN CHAT VIEW: Normal rich text entry component context */
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening on campus? Broadcast an update..."
              disabled={isPosting}
              className="w-full resize-none outline-hidden text-sm font-medium text-gray-700 placeholder-gray-400 bg-transparent disabled:opacity-50"
              rows={3}
            />
          )}

          {/* Form Action Footer Container */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                Posting as <span className="font-bold text-indigo-600">@{profile?.username || user?.email?.split('@')[0] || 'student'}</span>
              </div>
              
              {/* Token Counter indicator capsule */}
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                isThrottled 
                  ? 'bg-red-50 text-red-600 border-red-100' 
                  : tokensRemaining <= 1 
                  ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' 
                  : 'bg-gray-50 text-gray-500 border-gray-100'
              }`}>
                {tokensRemaining} / {maxTokens} tokens left
              </div>
            </div>

            {!isThrottled && (
              <button
                type="submit"
                disabled={isPosting || !newPost.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send size={13} />
                <span>{isPosting ? 'Posting...' : 'Post'}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Realtime Live Post Feed */}
      <div className="space-y-4">
        {posts
          .filter((post) => !post.parent_id) // Ensure comments don't double-render as main feed items
          .map((post) => {
            const showReplies = expandedPostIds.includes(post.id);

            return (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 transition-all hover:border-gray-200/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center font-bold text-sm shadow-2xs">
                    {post.profiles?.username?.charAt(0).toUpperCase() || post.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {post.profiles?.username || post.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-gray-400 gap-6">
                  <button 
                    onClick={() => toggleReplies(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      showReplies ? 'text-indigo-600' : 'hover:text-indigo-600'
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>{showReplies ? 'Hide Replies' : 'Reply'}</span>
                  </button>
                </div>

                {/* Nested Realtime Replies Tray */}
                {showReplies && <PostReplies postId={post.id} />}
              </div>
            );
          })}
        
        {posts.filter((post) => !post.parent_id).length === 0 && (
          <div className="text-center text-xs font-medium text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl bg-white">
            No active broadcast posts in this stream segment yet. Be the first to start the trend!
          </div>
        )}
      </div>
    </div>
  );
}