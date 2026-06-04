import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import PeerSearch from "../components/chat/PeerSearch";
import toast from "react-hot-toast";

export default function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  /**
   * ==============================
   * CREATE OR GET CHAT ROOM
   * ==============================
   */
  const handleStartConversation = useCallback(
    async (targetUserId: string) => {
      if (!user?.id || !targetUserId) {
        toast.error("Invalid chat participants");
        return;
      }

      try {
        /**
         * STEP 1: Find existing room between both users
         */
        const { data: existingRooms, error: fetchError } = await supabase
          .from("chat_participants")
          .select("room_id, user_id")
          .in("user_id", [user.id, targetUserId]);

        if (fetchError) throw fetchError;

        // Group by room_id
        const roomMap: Record<string, string[]> = {};

        (existingRooms || []).forEach((p: any) => {
          if (!roomMap[p.room_id]) roomMap[p.room_id] = [];
          roomMap[p.room_id].push(p.user_id);
        });

        // Find shared room with BOTH users
        let existingRoomId: string | null = null;

        Object.entries(roomMap).forEach(([roomId, users]) => {
          if (
            users.includes(user.id) &&
            users.includes(targetUserId) &&
            users.length === 2
          ) {
            existingRoomId = roomId;
          }
        });

        /**
         * STEP 2: If room exists → use it
         */
        if (existingRoomId) {
          toast.success("Opening existing chat...");
          navigate(`/messages/${existingRoomId}`);
          return;
        }

        /**
         * STEP 3: Create new room
         */
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({
            title: null,
          })
          .select()
          .single();

        if (roomError || !newRoom) throw roomError;

        /**
         * STEP 4: Insert participants
         */
        const { error: participantsError } = await supabase
          .from("chat_participants")
          .insert([
            {
              room_id: newRoom.id,
              user_id: user.id,
            },
            {
              room_id: newRoom.id,
              user_id: targetUserId,
            },
          ]);

        if (participantsError) throw participantsError;

        toast.success("Chat created successfully");

        /**
         * STEP 5: Navigate to MessagesPage
         */
        navigate(`/messages/${newRoom.id}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to start conversation");
      }
    },
    [user, navigate]
  );

  return (
    <div className="space-y-4 max-w-md mx-auto px-2 pb-24">
      <PeerSearch onInitiateChat={handleStartConversation} />
    </div>
  );
}