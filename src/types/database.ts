import type { Session, User } from "@supabase/supabase-js";

export type UserRole = "student" | "moderator" | "admin"   | "professor";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  verified_academic?: boolean;
  global_rank?: number;
  school?: string;
  whatsapp_number?: string;
}

export interface UserSession {
  user: User | null;
  session: Session | null;
}
export interface LocationKnowledgeNode {
  id: string;
  name: string;
  category: string;
  buildingName: string;
  floor: string;
  roomNumber: string;
  x: number;
  y: number;
  description: string;
  hours: string;
  services?: { id: string; name: string }[];
  documents?: { id: string; document_name: string }[];
}