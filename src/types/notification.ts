export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'announcement' | 'chat';
  sender_name: string;
  is_read: boolean;
  created_at: string;
};