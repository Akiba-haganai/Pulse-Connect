import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

interface ChatBoxProps {
  receiverId: string;
  receiverName: string;
  setRealtimeChannel: (channel: RealtimeChannel) => void;
}

export default function ChatBox({ receiverId, receiverName, setRealtimeChannel }: ChatBoxProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user!.id && newMsg.receiver_id === receiverId) ||
            (newMsg.sender_id === receiverId && newMsg.receiver_id === user!.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();
    setRealtimeChannel(channel);
    return () => {
      channel.unsubscribe();
    };
  }, [receiverId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      sender_id: user!.id,
      receiver_id: receiverId
    });
    if (!error) setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 font-semibold">{receiverName}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === user!.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender_id === user!.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <label htmlFor="messageInput" className="sr-only">Type a message</label>
        <input
          id="messageInput"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white p-2 rounded-full"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}