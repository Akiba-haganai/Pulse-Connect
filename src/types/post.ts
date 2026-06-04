export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}