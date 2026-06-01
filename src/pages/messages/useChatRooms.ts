import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface ChatRoomSummary {
  room_id: string;
  room_type: 'dm' | 'group';
  created_at: string;
  recipient: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  } | null;
}

export function useChatRooms(currentUserId: string | undefined) {
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserRooms = useCallback(async () => {
    if (!currentUserId) return;
    setIsLoading(true);

    try {
      // Find all room IDs current authenticated profile is in
      const { data: participationLines, error: partError } = await supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', currentUserId);

      if (partError) throw partError;
      if (!participationLines || participationLines.length === 0) {
        setRooms([]);
        return;
      }

      const activeRoomIds = participationLines.map(p => p.room_id);

      // Fetch full descriptive metadata for all rooms and join counter-party profiles
      const { data: rawRooms, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          type,
          created_at,
          chat_participants (
            user_id,
            profiles (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .in('id', activeRoomIds);

      if (roomError) throw roomError;

      // Transform raw payloads to extract counter-party recipient blocks directly
      const formattedRooms: ChatRoomSummary[] = (rawRooms || []).map((room: any) => {
        const counterParticipant = room.chat_participants?.find(
          (p: any) => p.user_id !== currentUserId
        );

        return {
          room_id: room.id,
          room_type: room.type,
          created_at: room.created_at,
          recipient: counterParticipant?.profiles || null
        };
      });

      setRooms(formattedRooms);
    } catch (err) {
      console.error('Failed to parse chat environment states:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchUserRooms();
  }, [fetchUserRooms]);

  return { rooms, isLoading, refetchRooms: fetchUserRooms };
}