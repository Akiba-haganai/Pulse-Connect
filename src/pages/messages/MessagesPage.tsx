import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatRooms } from './useChatRooms';
import { useLiveChatMessages } from './useLiveChatMessages';
import { supabase } from '../../lib/supabase';
import { Send, MessageSquarePlus, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { rooms, isLoading: loadingRooms} = useChatRooms(user?.id);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { messages, isLoading: loadingMessages } = useLiveChatMessages(activeRoomId);
  
  const [typedMessage, setTypedMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside active chat window
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find recipient data block for current open header panel mapping
  const activeRoom = rooms.find(r => r.room_id === activeRoomId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeRoomId || !user?.id) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: activeRoomId,
            sender_id: user.id,
            message_text: typedMessage.trim()
          }
        ]);

      if (error) throw error;
      setTypedMessage('');
    } catch (err: any) {
      toast.error('Failed to route transaction package.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-xs max-w-5xl mx-auto">
      
      {/* 🧭 LEFT COLUMN PANELS: ACTIVE INBOX STREAMS LIST */}
      <div className="w-1/3 border-r border-gray-50 flex flex-col bg-gray-50/40">
        <div className="p-4 bg-white border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Direct Messages</h2>
            <p className="text-[10px] text-gray-400 font-medium">Secured node-to-node channels</p>
          </div>
          <button
            onClick={() => toast('To start a chat, navigate to a peer\'s profile and click message!', { icon: '💡' })}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
            aria-label="Start a new chat"
            title="Start a new chat"
          >
            <MessageSquarePlus size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingRooms ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-gray-300" size={20} /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center text-[11px] font-medium text-gray-400 py-12 px-4 leading-normal">Your inbox index is empty. Find peers on campus to open chat routes.</div>
          ) : (
            rooms.map((room) => {
              const isActive = room.room_id === activeRoomId;
              return (
                <button
                  key={room.room_id}
                  onClick={() => setActiveRoomId(room.room_id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                    isActive ? 'bg-white border border-gray-100 shadow-3xs text-indigo-600 font-bold' : 'hover:bg-gray-100/70 text-gray-700'
                  }`}
                >
                  <div className="h-8 w-8 bg-indigo-600 text-white font-bold text-xs flex items-center justify-center rounded-lg overflow-hidden border shadow-3xs">
                    {room.recipient?.avatar_url ? (
                      <img src={room.recipient.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (room.recipient?.full_name?.charAt(0) || 'U').toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate font-bold text-gray-900">{room.recipient?.full_name || 'Anonymous Peer'}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">@{room.recipient?.username || 'inactive_node'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 💬 RIGHT COLUMN PANELS: MAIN PRIVATE STREAM ROOM THREAD */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeRoomId && activeRoom ? (
          <>
            {/* Thread Active Room Header */}
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white z-10 shadow-3xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center rounded-lg border">
                  {(activeRoom.recipient?.full_name?.charAt(0) || 'U').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{activeRoom.recipient?.full_name || 'Active Communication Node'}</h3>
                  <p className="text-[9px] font-bold text-emerald-500 tracking-wide uppercase flex items-center gap-0.5"><ShieldCheck size={10}/> End-to-End Handshake Active</p>
                </div>
              </div>
            </div>

            {/* Live Message List Stream Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/30">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-gray-300" /></div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex max-w-[80%] flex-col ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed shadow-3xs ${
                        isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                        {msg.message_text}
                      </div>
                      <span className="text-[8px] text-gray-400 font-medium px-1 mt-0.5">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Sticky Chat Entry Command Form */}
            <div className="p-3 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Type an isolated direct peer transmission..."
                  disabled={isSending}
                  className="flex-1 p-2.5 border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSending || !typedMessage.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-40"
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty Active Stream Placeholder View */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/20">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-2 border border-indigo-100/50"><Send size={24} className="rotate-45 -translate-y-0.5 translate-x-0.5" /></div>
            <h4 className="text-xs font-bold text-gray-900">No active thread selected</h4>
            <p className="text-[10px] text-gray-400 max-w-xs font-medium mt-1 leading-normal">Pick an existing inbox routing node from the sidebar console channel list to establish live communication link matrices.</p>
          </div>
        )}
      </div>

    </div>
  );
}