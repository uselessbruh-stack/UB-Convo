import { IoEllipsisVertical, IoArrowBack, IoInformationCircle } from 'react-icons/io5';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../ui/Avatar';
import { formatLastSeen } from '../../utils/formatTime';

export default function ChatHeader({ chat, currentUserId }) {
  const { closeChat, toggleChatInfo } = useChat();

  const isGroup = chat.type === 'group';
  const otherMemberId = !isGroup ? chat.members.find((m) => m !== currentUserId) : null;
  const otherMember = otherMemberId ? chat.memberDetails?.[otherMemberId] : null;

  const chatName = isGroup ? chat.groupName : (otherMember?.name || otherMember?.username || 'Unknown');
  const chatAvatar = isGroup ? chat.groupIcon : otherMember?.profilePicUrl;

  let statusText = '';
  if (isGroup) {
    statusText = `${chat.members?.length || 0} members`;
  } else if (otherMember?.isOnline) {
    statusText = 'Online';
  } else if (otherMember?.lastSeen) {
    statusText = `Last seen ${formatLastSeen(otherMember.lastSeen)}`;
  }

  return (
    <div className="chat-header">
      <button className="btn-icon chat-back-btn" onClick={closeChat}>
        <IoArrowBack size={20} />
      </button>

      <div className="chat-header-info" onClick={toggleChatInfo}>
        <Avatar
          src={chatAvatar}
          name={chatName}
          size="md"
          online={!isGroup ? otherMember?.isOnline : undefined}
        />
        <div className="chat-header-details">
          <span className="chat-header-name">{chatName}</span>
          <span className={`chat-header-status ${!isGroup && otherMember?.isOnline ? 'online' : ''}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="chat-header-actions">
        <button className="btn-icon" onClick={toggleChatInfo} title="Chat Info">
          <IoInformationCircle size={22} />
        </button>
      </div>
    </div>
  );
}
