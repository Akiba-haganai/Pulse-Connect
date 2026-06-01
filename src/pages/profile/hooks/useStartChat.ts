import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export function useStartChat() {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);

  const startPrivateChat = async (targetPeerId: string) => {
    if (!currentUser?.id) {
      return toast.error('You must be logged in to initialize a chat routing matrix.');
    }

    if (currentUser.id === targetPeerId) {
      return toast.error("You cannot open an isolated chat channel with yourself.");
    }

    setIsInitializing(true);

    try {
      // 1. Check if a common chat room matrix already exists between these two profiles
      const { data: existingRooms, error: lookupError } = await supabase
        .rpc('find_existing_dm_room', {
          user_a: currentUser.id,
          user_b: targetPeerId
        });

      if (lookupError) throw lookupError;

      // If a room already exists, skip creation and route straight to it!
      if (existingRooms && existingRooms.length > 0 && existingRooms[0].room_id) {
        navigate('/messages');
        return;
      }

      // 2. If no room exists, initialize a brand new chat room node
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([{ type: 'dm' }])
        .select()
        .single();

      if (roomError) throw roomError;

      // 3. Link both users as active participants inside the new room boundary
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: newRoom.id, user_id: currentUser.id },
          { room_id: newRoom.id, user_id: targetPeerId }
        ]);

      if (participantError) throw participantError;

      toast.success('Secure chat node initialized successfully!');
      
      // 4. Redirect to the message workspace
      navigate('/messages');

    } catch (err: any) {
      console.error(err);
      toast.error('Database rejected message initialization handshakes.');
    } finally {
      setIsInitializing(false);
    }
  };

  return { startPrivateChat, isInitializing };
}