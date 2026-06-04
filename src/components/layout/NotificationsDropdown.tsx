import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Megaphone, MessageSquare, Check} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcement' | 'chat'>('announcement');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications = [], unreadCount, markAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // FILTER FIX: use "type" instead of "category"
  const announcements = useMemo(
    () => notifications.filter((n) => n.type === 'announcement'),
    [notifications]
  );

  const chats = useMemo(
    () => notifications.filter((n) => n.type === 'chat'),
    [notifications]
  );

  const unreadAnnouncements = useMemo(
    () => announcements.filter((n) => !n.is_read),
    [announcements]
  );

  const unreadChats = useMemo(
    () => chats.filter((n) => !n.is_read),
    [chats]
  );

  // ✅ FIX: REMOVED totalUnread - using unreadCount from hook instead

  const activeList = activeTab === 'announcement' ? announcements : chats;
  const currentUnread = activeTab === 'announcement' ? unreadAnnouncements : unreadChats;

  const handleMarkAll = () => {
    const ids = currentUnread.map((n) => n.id);
    if (ids.length > 0) {
      markAsRead(ids); // now matches hook type
    }
  };

  const formatTime = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;

    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell size={22} />
        {/* ✅ FIX: Using unreadCount from hook directly */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-bold text-sm">Notifications</span>

            {currentUnread.length > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-600 flex items-center gap-1"
              >
                <Check size={12} />
                Mark all
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex text-xs font-semibold border-b">
            <button
              onClick={() => setActiveTab('announcement')}
              className={`flex-1 py-2 flex items-center justify-center gap-1 ${activeTab === 'announcement' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              <Megaphone size={12} /> Announcements
              {unreadAnnouncements.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1 rounded-full ml-1">
                  {unreadAnnouncements.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 flex items-center justify-center gap-1 ${activeTab === 'chat' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
            >
              <MessageSquare size={12} /> Chats
              {unreadChats.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1 rounded-full ml-1">
                  {unreadChats.length}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y">
            {activeList.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No {activeTab === 'announcement' ? 'announcements' : 'chats'}
              </div>
            ) : (
              activeList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead([n.id])}
                  className={`p-3 cursor-pointer ${
                    !n.is_read ? 'bg-gray-50 dark:bg-gray-800/30' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {n.message || 'Notification'}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}