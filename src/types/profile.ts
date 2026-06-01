export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'professor' | 'admin' | string;
  created_at: string;
  // New Social Fields
  bio: string | null;
  verified_academic: boolean;
  global_rank: number | null;
};

export type ProfileStats = {
  total_uploads: number;
  total_accrued_downloads: number;
  follower_count: number;
  following_count: number;
};
