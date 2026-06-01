import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Megaphone, MessageSquare, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
// 🛠️ VERBATIM COMPILER FIX: Explicit type import to satisfy strict project rules
import type { NotificationItem } from '../../types/notification';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcement' | 'chat'>('announcement');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Guard values with a fallback empty array to prevent undefined map crashes
  const { notifications = [], loading, markAsRead } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⚡ PERFORMANCE MEMOIZATION: Keeps arrays from recalculating on every re-render
  const announcements = useMemo(() => 
    notifications.filter((n) => n?.category === 'announcement'), 
    [notifications]
  );
  
  const chats = useMemo(() => 
    notifications.filter((n) => n?.category === 'chat'), 
    [notifications]
  );

  const unreadAnnouncements = useMemo(() => 
    announcements.filter((n) => !n?.is_read), 
    [announcements]
  );
  
  const unreadChats = useMemo(() => 
    chats.filter((n) => !n?.is_read), 
    [chats]
  );

  const totalUnread = unreadAnnouncements.length + unreadChats.length;

  // 🛠️ LOGIC FIX: 'activeList' displays ALL items, 'currentUnread' is used for the "Mark all" action
  const activeList = activeTab === 'announcement' ? announcements : chats;
  const currentUnread = activeTab === 'announcement' ? unreadAnnouncements : unreadChats;

  const handleMarkAll = () => {
    const ids = currentUnread.map((n) => n.id).filter(Boolean);
    if (ids.length > 0) {
      markAsRead?.(ids);
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
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors focus:outline-hidden"
      >
        <Bell size={22} />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all max-w-[calc(100vw-2rem)]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-3.5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Notifications</span>
            {currentUnread.length > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-hidden"
              >
                <Check size={12} />
                Mark all
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setActiveTab('announcement')}
              className={`flex-1 py-2.5 flex justify-center items-center gap-1.5 border-b-2 transition-all focus:outline-hidden ${
                activeTab === 'announcement'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10 font-bold'
                  : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Megaphone size={13} />
              <span>Announcements</span>
              {unreadAnnouncements.length > 0 && (
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full text-[10px]">
                  {unreadAnnouncements.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 flex justify-center items-center gap-1.5 border-b-2 transition-all focus:outline-hidden ${
                activeTab === 'chat'
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 bg-emerald-50/10 dark:bg-emerald-950/10 font-bold'
                  : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare size={13} />
              <span>Chats</span>
              {unreadChats.length > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px]">
                  {unreadChats.length}
                </span>
              )}
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <Loader2 className="animate-spin text-indigo-500" size={20} />
              </div>
            ) : activeList.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
                No notifications in this category
              </div>
            ) : (
              activeList.map((n: NotificationItem) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead?.([n.id])}
                  className={`p-3.5 flex flex-col gap-0.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 cursor-pointer transition-colors relative ${
                    !n.is_read ? (activeTab === 'announcement' ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : 'bg-emerald-50/10 dark:bg-emerald-950/5') : ''
                  }`}
                >
                  {/* Left Side Unread Accent Indicator Dot */}
                  {!n.is_read && (
                    <span className={`absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full ${activeTab === 'announcement' ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
                  )}

                  <div className="flex justify-between items-baseline gap-2 pl-1">
                    <p className={`text-xs text-gray-900 dark:text-gray-100 truncate ${!n.is_read ? 'font-bold' : 'font-medium'}`}>
                      {n.title || 'Untitled Notification'}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                      {formatTime(n.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 pl-1">
                    {n.content}
                  </p>

                  {n.sender_name && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1 mt-0.5">
                      From: {n.sender_name}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}