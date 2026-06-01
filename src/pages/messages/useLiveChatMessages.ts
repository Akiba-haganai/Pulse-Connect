import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export function useLiveChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!roomId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          room_id,
          sender_id,
          message_text,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as unknown as ChatMessage[]);
    } catch (e) {
      console.error('Message payload extraction aborted:', e);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();

    if (!roomId) return;

    // Open an individual scoped channel listener matching current active room context
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          // Join sender metadata to the new incoming message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const receivedMessage: ChatMessage = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            sender_id: payload.new.sender_id,
            message_text: payload.new.message_text,
            created_at: payload.new.created_at,
            profiles: senderProfile
          };

          setMessages((prev) => [...prev, receivedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchMessages]);

  return { messages, isLoading };
}