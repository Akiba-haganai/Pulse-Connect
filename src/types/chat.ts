export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  last_seen_message_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
}