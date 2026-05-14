import { useState, useEffect } from 'react';
import { IoSearch, IoChatbubbleEllipses, IoSettingsSharp, IoLogOut, IoAdd } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useToast } from '../../contexts/ToastContext';
import { subscribeToChatList } from '../../services/chatService';
import { logOut } from '../../services/authService';
import ChatListItem from '../chat/ChatListItem';
import Avatar from '../ui/Avatar';

export default function Sidebar({ onSettingsClick }) {
  const { user, userProfile } = useAuth();
  const { activeChat, openChat, setShowNewChat } = useChat();
  const toast = useToast();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChatList(user.uid, (chatList) => {
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (chat.type === 'group') {
      return chat.groupName?.toLowerCase().includes(query);
    }

    // For direct chats, search through member names
    const otherMemberId = chat.members.find((m) => m !== user.uid);
    const otherMember = chat.memberDetails?.[otherMemberId];
    return (
      otherMember?.name?.toLowerCase().includes(query) ||
      otherMember?.username?.toLowerCase().includes(query)
    );
  });

  const handleLogout = async () => {
    try {
      await logOut();
      toast.info('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <div className="sidebar-header-actions">
          <button
            className="btn-icon"
            onClick={() => setShowNewChat(true)}
            title="New Chat"
          >
            <IoAdd size={22} />
          </button>
          <button
            className="btn-icon"
            onClick={onSettingsClick}
            title="Settings"
          >
            <IoSettingsSharp size={19} />
          </button>
          <button
            className="btn-icon"
            onClick={handleLogout}
            title="Sign Out"
          >
            <IoLogOut size={19} />
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <IoSearch size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-list">
        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', alignItems: 'center' }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton skeleton-text short" />
                  <div className="skeleton skeleton-text medium" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="chat-list-empty">
            <div className="chat-list-empty-icon">
              <IoChatbubbleEllipses />
            </div>
            <h3>{searchQuery ? 'No results' : 'No conversations yet'}</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : 'Start a new conversation by clicking the + button above'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              currentUserId={user.uid}
              isActive={activeChat?.id === chat.id}
              onClick={() => openChat(chat)}
            />
          ))
        )}
      </div>

      {/* User info at bottom */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <Avatar
          src={userProfile?.profilePicUrl}
          name={userProfile?.name}
          size="sm"
          online={true}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }} className="truncate">{userProfile?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }} className="truncate">@{userProfile?.username}</div>
        </div>
      </div>
    </div>
  );
}
