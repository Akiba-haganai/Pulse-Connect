import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  // load messages
  useEffect(() => {
    if (!roomId) return;

    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at");

      setMessages((data || []) as any[]);
    };

    load();

    // realtime
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: user?.id,
      content: text,
    });

    setText("");
  };

  return (
    <div className="p-3 flex flex-col h-screen">
      
      {/* messages */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`p-2 rounded max-w-xs ${
              m.sender_id === user?.id
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Message..."
        />
        <button onClick={sendMessage} className="bg-indigo-600 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
}