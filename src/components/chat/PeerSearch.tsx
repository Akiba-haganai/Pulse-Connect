import { Search } from "lucide-react";
import { usePeerSearch } from "../../pages/home/usePeerSearch";
import type { Profile } from "../../types/profile";

interface PeerSearchProps {
  onInitiateChat: (userId: string) => void;
}

export default function PeerSearch({ onInitiateChat }: PeerSearchProps) {
  const {
    peers,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    isLoading,
  } = usePeerSearch();

  return (
    <div className="space-y-3">

      {/* SEARCH BAR */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find students, lecturers..."
            className="w-full border rounded-xl pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border rounded-xl px-3 py-2 text-xs"
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="professor">Lecturers</option>
          <option value="moderator">Moderators</option>
        </select>
      </div>

      {/* RESULTS */}
      {isLoading ? (
        <div className="text-xs text-gray-400 px-2 py-2">
          Searching peers...
        </div>
      ) : peers.length === 0 ? (
        <div className="text-xs text-gray-400 px-2 py-2">
          No users found.
        </div>
      ) : (
        <div className="space-y-2">
          {peers.map((peer: Profile) => (
            <div
              key={peer.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {peer.full_name?.charAt(0) || "U"}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-xs truncate">
                    {peer.full_name || "Unknown User"}
                  </p>

                  <p className="text-[10px] text-gray-500 truncate">
                    @{peer.username || "no-username"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onInitiateChat(peer.id)}
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer"
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}