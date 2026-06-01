import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

interface PostRepliesProps {
  postId: string;
}

export default function PostReplies({ postId }: PostRepliesProps) {
  const { user } = useAuthStore();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch historical thread replies
  useEffect(() => {
    const fetchReplies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, content, created_at, user_id,
            profiles (username, full_name)
          `)
          .eq('parent_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setReplies(data as unknown as Reply[]);
      } catch (err) {
        console.error('Failed fetching conversation threads:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();

    // 2. Real-time Subscription to updates on *this specific* thread
    const channel = supabase
      .channel(`replies:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `parent_id=eq.${postId}` },
        async (payload) => {
          // Fetch sender profile context quickly
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', payload.new.user_id)
            .single();

          const completeReply: Reply = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            profiles: profile
          };

          setReplies((prev) => [...prev, completeReply]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  // 3. Post a Reply
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert([
        {
          content: newReply.trim(),
          user_id: user.id,
          parent_id: postId // Ties it directly to the parent post node
        }
      ]);

      if (error) throw error;
      setNewReply('');
    } catch (err) {
      toast.error('Failed to submit comment thread node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-50 bg-gray-50/40 -mx-4 -mb-4 p-4 rounded-b-xl space-y-3">
      {/* List of existing comments */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {isLoading && replies.length === 0 ? (
          <div className="flex justify-center py-2">
            <Loader2 size={14} className="animate-spin text-gray-400" />
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-3xs text-[11px] leading-relaxed">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-0.5">
                <span>@{reply.profiles?.username || 'peer'}</span>
                <span className="font-medium text-gray-400">
                  {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Reply input field */}
      <form onSubmit={handlePostReply} className="flex gap-2 items-center">
        <input
          type="text"
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Contribute to the conversation thread..."
          disabled={isSubmitting}
          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-gray-700"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newReply.trim()}
          title="Send reply"
          className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Send size={11} />
        </button>
      </form>
    </div>
  );
}