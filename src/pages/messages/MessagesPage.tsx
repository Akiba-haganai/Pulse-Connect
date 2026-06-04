import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import PeerSearch from "../../components/chat/PeerSearch";

type ChatRoom = {
  id: string;
  title?: string;
  created_at: string;
};

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
};

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "search">("chats");

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);

  /**
   * =========================
   * LOAD CHAT ROOMS
   * =========================
   */
  const fetchRooms = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);

    const { data, error } = await supabase
      .from("chat_participants")
      .select(`
        chat_rooms (
          id,
          title,
          created_at
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      toast.error("Failed to load chats");
      return;
    }

    const formatted = (data || [])
      .map((r: any) => r.chat_rooms)
      .flat();

    setRooms(formatted);
    setLoadingRooms(false);
  }, [user]);

  /**
   * =========================
   * LOAD MESSAGES
   * =========================
   */
  const fetchMessages = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        id,
        room_id,
        sender_id,
        content,
        created_at
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setMessages(data || []);
  }, []);

  /**
   * =========================
   * SEND MESSAGE
   * =========================
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    const { error } = await supabase.from("chat_messages").insert({
      room_id: activeRoom,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Message failed to send");
      return;
    }

    setNewMessage("");
  };

  /**
   * =========================
   * OPEN ROOM
   * =========================
   */
  const openRoom = (roomId: string) => {
    setActiveRoom(roomId);
    fetchMessages(roomId);
    navigate(`/messages/${roomId}`);
  };

  const handleStartConversation = useCallback(
    async (targetUserId: string) => {
      if (!user?.id || !targetUserId) {
        toast.error("Invalid chat participants");
        return;
      }

      try {
        const { data: existingRooms, error: fetchError } = await supabase
          .from("chat_participants")
          .select("room_id, user_id")
          .in("user_id", [user.id, targetUserId]);

        if (fetchError) throw fetchError;

        const roomMap: Record<string, string[]> = {};

        (existingRooms || []).forEach((p: any) => {
          if (!roomMap[p.room_id]) roomMap[p.room_id] = [];
          roomMap[p.room_id].push(p.user_id);
        });

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

        if (existingRoomId) {
          toast.success("Opening existing chat...");
          openRoom(existingRoomId);
          setSidebarTab("chats");
          return;
        }

        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({
            title: null,
          })
          .select()
          .single();

        if (roomError || !newRoom) throw roomError;

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
        await fetchRooms();
        openRoom(newRoom.id);
        setSidebarTab("chats");
      } catch (err) {
        console.error(err);
        toast.error("Failed to start conversation");
      }
    },
    [user, fetchRooms]
  );

  /**
   * =========================
   * REALTIME MESSAGES
   * =========================
   */
  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${activeRoom}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom]);

  /**
   * =========================
   * INIT
   * =========================
   */
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (roomId) {
      setActiveRoom(roomId);
      fetchMessages(roomId);
    }
  }, [roomId, fetchMessages]);

  return (
    <div className="h-[calc(100vh-80px)] flex max-w-5xl mx-auto border border-gray-100 dark:border-gray-900 rounded-2xl overflow-hidden">

      {/* ===================== */}
      {/* LEFT: CHAT ROOMS & PEER SEARCH */}
      {/* ===================== */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-900 bg-white dark:bg-black overflow-y-auto">

        <div className="flex border-b border-gray-100 dark:border-gray-900">
          <button
            onClick={() => setSidebarTab("chats")}
            className={`flex-1 py-3 text-xs font-bold transition ${
              sidebarTab === "chats"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400"
            }`}
          >
            CHATS
          </button>
          <button
            onClick={() => setSidebarTab("search")}
            className={`flex-1 py-3 text-xs font-bold transition ${
              sidebarTab === "search"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400"
            }`}
          >
            PEERS
          </button>
        </div>

        {sidebarTab === "chats" ? (
          loadingRooms ? (
            <div className="p-4 text-xs text-gray-400">Loading...</div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-xs text-gray-400">
              No conversations yet
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => openRoom(room.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-50 dark:border-gray-900 ${
                  activeRoom === room.id ? "bg-gray-100 dark:bg-gray-900" : ""
                }`}
              >
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {room.title || "Chat Room"}
                </p>
                <p className="text-[10px] text-gray-400">
                  Tap to open conversation
                </p>
              </div>
            ))
          )
        ) : (
          <div className="p-3">
            <PeerSearch onInitiateChat={handleStartConversation} />
          </div>
        )}
      </div>

      {/* ===================== */}
      {/* RIGHT: MESSAGES */}
      {/* ===================== */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!activeRoom ? (
            <div className="text-center text-xs text-gray-400 mt-10">
              Select a chat to start messaging
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`max-w-[70%] px-3 py-2 rounded-xl text-xs font-medium ${
                    isMine
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-white dark:bg-black text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        {activeRoom && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-900 flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white p-2 rounded-xl"
            >
              <Send size={14} />send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}