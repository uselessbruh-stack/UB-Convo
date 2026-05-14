import { useState, useEffect } from 'react';
import { IoClose, IoMail, IoCall, IoCalendar, IoLogOut, IoTrash, IoNotificationsOff, IoPeople } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserProfile } from '../../services/userService';
import { leaveGroup } from '../../services/chatService';
import Avatar from '../ui/Avatar';
import { formatJoinDate, formatLastSeen } from '../../utils/formatTime';

export default function ChatInfoPanel() {
  const { user } = useAuth();
  const { activeChat, setShowChatInfo, closeChat } = useChat();
  const toast = useToast();
  const [memberProfiles, setMemberProfiles] = useState({});

  const isGroup = activeChat?.type === 'group';
  const otherMemberId = !isGroup ? activeChat?.members?.find((m) => m !== user.uid) : null;

  useEffect(() => {
    if (!activeChat) return;

    const loadProfiles = async () => {
      const profiles = {};
      for (const memberId of activeChat.members || []) {
        if (memberId !== user.uid) {
          try {
            const profile = await getUserProfile(memberId);
            if (profile) profiles[memberId] = profile;
          } catch {}
        }
      }
      setMemberProfiles(profiles);
    };

    loadProfiles();
  }, [activeChat, user.uid]);

  if (!activeChat) return null;

  const otherProfile = otherMemberId ? memberProfiles[otherMemberId] : null;
  const chatName = isGroup ? activeChat.groupName : (otherProfile?.name || activeChat.memberDetails?.[otherMemberId]?.name || 'Unknown');
  const chatAvatar = isGroup ? activeChat.groupIcon : (otherProfile?.profilePicUrl || activeChat.memberDetails?.[otherMemberId]?.profilePicUrl);

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(activeChat.id, user.uid);
      closeChat();
      toast.info('You left the group');
    } catch {
      toast.error('Failed to leave group');
    }
  };

  return (
    <div className="chat-info-panel">
      <div className="chat-info-header">
        <button className="btn-icon" onClick={() => setShowChatInfo(false)}>
          <IoClose size={20} />
        </button>
        <h3>{isGroup ? 'Group Info' : 'Contact Info'}</h3>
      </div>

      <div className="chat-info-profile">
        <Avatar src={chatAvatar} name={chatName} size="3xl" />
        <div className="chat-info-name">{chatName}</div>
        {!isGroup && otherProfile?.username && (
          <div className="chat-info-username">@{otherProfile.username}</div>
        )}
        {isGroup && activeChat.groupDescription && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {activeChat.groupDescription}
          </p>
        )}
      </div>

      {/* Contact/Group Details */}
      <div className="chat-info-section">
        <div className="chat-info-section-title">
          {isGroup ? 'Group Details' : 'About'}
        </div>

        {!isGroup && (
          <>
            {otherProfile?.email && (otherProfile?.settings?.showEmail !== false) && (
              <div className="chat-info-row">
                <span className="chat-info-row-label"><IoMail /> Email</span>
                <span className="chat-info-row-value">{otherProfile.email}</span>
              </div>
            )}
            {otherProfile?.phoneNumber && (otherProfile?.settings?.showPhone !== false) && (
              <div className="chat-info-row">
                <span className="chat-info-row-label"><IoCall /> Phone</span>
                <span className="chat-info-row-value">{otherProfile.phoneNumber}</span>
              </div>
            )}
            {otherProfile?.createdAt && (
              <div className="chat-info-row">
                <span className="chat-info-row-label"><IoCalendar /> Joined</span>
                <span className="chat-info-row-value">{formatJoinDate(otherProfile.createdAt)}</span>
              </div>
            )}
            {otherProfile?.lastSeen && !otherProfile?.isOnline && (otherProfile?.settings?.lastActiveStatus !== false) && (
              <div className="chat-info-row">
                <span className="chat-info-row-label">Last seen</span>
                <span className="chat-info-row-value">{formatLastSeen(otherProfile.lastSeen)}</span>
              </div>
            )}
          </>
        )}

        {isGroup && (
          <div className="chat-info-row">
            <span className="chat-info-row-label"><IoPeople /> Members</span>
            <span className="chat-info-row-value">{activeChat.members?.length || 0}</span>
          </div>
        )}
      </div>

      {/* Group Members */}
      {isGroup && (
        <div className="chat-info-section">
          <div className="chat-info-section-title">Members</div>
          {activeChat.members?.map((memberId) => {
            const member = memberProfiles[memberId] || activeChat.memberDetails?.[memberId];
            const isAdmin = activeChat.admins?.includes(memberId);
            const isMe = memberId === user.uid;

            return (
              <div key={memberId} className="user-search-item" style={{ padding: '8px 0' }}>
                <Avatar
                  src={member?.profilePicUrl}
                  name={member?.name || 'Unknown'}
                  size="sm"
                />
                <div className="user-search-item-info">
                  <div className="user-search-item-name">
                    {member?.name || 'Unknown'} {isMe && '(You)'}
                  </div>
                  {member?.username && (
                    <div className="user-search-item-username">@{member.username}</div>
                  )}
                </div>
                {isAdmin && (
                  <span className="badge" style={{ fontSize: 10, padding: '2px 8px', minWidth: 'auto' }}>Admin</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="chat-info-section">
        <div className="chat-info-section-title">Actions</div>
        <button className="chat-info-action">
          <IoNotificationsOff /> Mute Notifications
        </button>
        {isGroup && (
          <button className="chat-info-action danger" onClick={handleLeaveGroup}>
            <IoLogOut /> Leave Group
          </button>
        )}
        <button className="chat-info-action danger">
          <IoTrash /> Delete Chat
        </button>
      </div>
    </div>
  );
}


