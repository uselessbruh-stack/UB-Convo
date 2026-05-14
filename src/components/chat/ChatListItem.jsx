import Avatar from '../ui/Avatar';
import { formatChatListTime } from '../../utils/formatTime';

export default function ChatListItem({ chat, currentUserId, isActive, onClick }) {
  const isGroup = chat.type === 'group';

  // Get info for the other user in direct chats
  const otherMemberId = !isGroup ? chat.members.find((m) => m !== currentUserId) : null;
  const otherMember = otherMemberId ? chat.memberDetails?.[otherMemberId] : null;

  const chatName = isGroup ? chat.groupName : (otherMember?.name || otherMember?.username || 'Unknown');
  const chatAvatar = isGroup ? chat.groupIcon : otherMember?.profilePicUrl;

  const lastMsg = chat.lastMessage;
  let previewText = '';
  if (lastMsg) {
    if (lastMsg.senderId === currentUserId) {
      previewText = `You: ${lastMsg.text || ''}`;
    } else {
      previewText = isGroup
        ? `${lastMsg.senderName?.split(' ')[0]}: ${lastMsg.text || ''}`
        : lastMsg.text || '';
    }
  }

  const unreadCount = 0; // TODO: implement unread tracking

  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'chat-list-item-unread' : ''}`}
      onClick={onClick}
    >
      <div className="chat-list-item-avatar">
        <Avatar
          src={chatAvatar}
          name={chatName}
          size="lg"
          online={!isGroup ? otherMember?.isOnline : undefined}
        />
      </div>

      <div className="chat-list-item-content">
        <div className="chat-list-item-header">
          <span className="chat-list-item-name">{chatName}</span>
          {lastMsg?.timestamp && (
            <span className="chat-list-item-time">
              {formatChatListTime(lastMsg.timestamp)}
            </span>
          )}
        </div>
        <div className="chat-list-item-preview">
          <span className="chat-list-item-message">
            {previewText || (isGroup ? 'Group created' : 'Start a conversation')}
          </span>
          {unreadCount > 0 && (
            <span className="badge">{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
