interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    profiles: { full_name: string; avatar_url: string | null };
  };
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
          {post.profiles.full_name?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-semibold">{post.profiles.full_name}</p>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(new Date(post.created_at))}
          </p>
        </div>
      </div>
      <p className="text-gray-800">{post.content}</p>
    </div>
  );
}