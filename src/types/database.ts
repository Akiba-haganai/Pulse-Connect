export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'admin';
};

export type UserSession = {
  user: any | null;
  session: any | null;
};