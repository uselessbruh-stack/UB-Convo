import { useState, useEffect, useRef } from 'react';
import { IoClose, IoSearch, IoPeople, IoChatbubble } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useToast } from '../../contexts/ToastContext';
import { searchUsers } from '../../services/userService';
import { createDirectChat, createGroupChat } from '../../services/chatService';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

export default function NewChatModal() {
  const { user, userProfile } = useAuth();
  const { setShowNewChat, openChat } = useChat();
  const toast = useToast();

  const [mode, setMode] = useState('direct'); // 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery, user.uid);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
      setSearching(false);
    }, 400);
  }, [searchQuery, user.uid]);

  const handleUserSelect = (selectedUser) => {
    if (mode === 'direct') {
      handleCreateDirectChat(selectedUser);
    } else {
      const isSelected = selectedUsers.find((u) => u.id === selectedUser.id);
      if (isSelected) {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } else {
        setSelectedUsers((prev) => [...prev, selectedUser]);
      }
    }
  };

  const handleCreateDirectChat = async (otherUser) => {
    setCreating(true);
    try {
      const chatId = await createDirectChat(
        { id: user.uid, ...userProfile },
        { id: otherUser.id, ...otherUser }
      );
      openChat({ id: chatId, type: 'direct', members: [user.uid, otherUser.id], memberDetails: { [user.uid]: userProfile, [otherUser.id]: otherUser } });
      setShowNewChat(false);
      toast.success(`Chat started with ${otherUser.name || otherUser.username}`);
    } catch (error) {
      toast.error('Failed to create chat');
    }
    setCreating(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.warning('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 1) {
      toast.warning('Select at least one member');
      return;
    }

    setCreating(true);
    try {
      const chatId = await createGroupChat(
        { id: user.uid, ...userProfile },
        selectedUsers,
        groupName.trim()
      );
      openChat({ id: chatId, type: 'group', groupName: groupName.trim(), members: [user.uid, ...selectedUsers.map(u => u.id)] });
      setShowNewChat(false);
      toast.success(`Group "${groupName.trim()}" created`);
    } catch (error) {
      toast.error('Failed to create group');
    }
    setCreating(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{mode === 'direct' ? 'New Chat' : 'New Group'}</h3>
          <button className="btn-icon" onClick={() => setShowNewChat(false)}>
            <IoClose size={20} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="tab-nav">
          <button
            className={`tab-nav-item ${mode === 'direct' ? 'active' : ''}`}
            onClick={() => { setMode('direct'); setSelectedUsers([]); }}
          >
            <IoChatbubble style={{ marginRight: 6 }} /> Direct Message
          </button>
          <button
            className={`tab-nav-item ${mode === 'group' ? 'active' : ''}`}
            onClick={() => setMode('group')}
          >
            <IoPeople style={{ marginRight: 6 }} /> Group Chat
          </button>
        </div>

        <div className="modal-body">
          {/* Group name input */}
          {mode === 'group' && (
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Group Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          {/* Selected members (group mode) */}
          {mode === 'group' && selectedUsers.length > 0 && (
            <div className="selected-members">
              {selectedUsers.map((u) => (
                <div key={u.id} className="member-chip">
                  <Avatar src={u.profilePicUrl} name={u.name} size="sm" />
                  {u.name || u.username}
                  <button
                    className="member-chip-remove"
                    onClick={() => setSelectedUsers((p) => p.filter((su) => su.id !== u.id))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="search-input-wrapper">
            <IoSearch size={16} />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="user-search-results">
            {searching ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spinner /></div>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontSize: 14 }}>
                No users found
              </div>
            ) : (
              searchResults.map((u) => {
                const isSelected = selectedUsers.find((su) => su.id === u.id);
                return (
                  <div
                    key={u.id}
                    className={`user-search-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(u)}
                  >
                    <Avatar src={u.profilePicUrl} name={u.name} size="md" />
                    <div className="user-search-item-info">
                      <div className="user-search-item-name">{u.name || 'Unknown'}</div>
                      {u.username && (
                        <div className="user-search-item-username">@{u.username}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {mode === 'group' && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowNewChat(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateGroup}
              disabled={creating || !groupName.trim() || selectedUsers.length === 0}
            >
              {creating ? <Spinner size="sm" /> : `Create Group (${selectedUsers.length + 1})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
