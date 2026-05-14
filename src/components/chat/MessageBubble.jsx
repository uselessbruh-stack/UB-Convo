import { useState } from 'react';
import { IoCheckmark, IoCheckmarkDone, IoDownload, IoChevronDown } from 'react-icons/io5';
import { IoCopy, IoTrash, IoTrashBin } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { deleteMessageForMe, deleteMessageForEveryone } from '../../services/messageService';
import { formatMessageTime } from '../../utils/formatTime';
import { formatFileSize, getFileIcon } from '../../utils/fileUtils';
import ContextMenu from '../ui/ContextMenu';

export default function MessageBubble({ message, isSent, isGroup, chatId, onImageClick }) {
  const { user } = useAuth();
  const toast = useToast();
  const [contextMenu, setContextMenu] = useState(null);

  if (message.isDeleted) {
    return (
      <div className={`message-row ${isSent ? 'sent' : 'received'}`}>
        <div className="message-bubble">
          <p className="message-deleted">🚫 This message was deleted</p>
          <div className="message-meta">
            <span className="message-time">{formatMessageTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleActionClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 4 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    toast.success('Message copied');
  };

  const handleDeleteForMe = async () => {
    try {
      await deleteMessageForMe(chatId, message.id, user.uid);
      toast.info('Message deleted for you');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteForEveryone = async () => {
    try {
      await deleteMessageForEveryone(chatId, message.id, message);
      toast.info('Message deleted for everyone');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started');
    } catch {
      toast.error('Failed to download file');
    }
  };

  const contextMenuItems = [
    ...(message.text ? [{ label: 'Copy', icon: <IoCopy />, onClick: handleCopy }] : []),
    { label: 'Delete for me', icon: <IoTrash />, onClick: handleDeleteForMe },
    ...(isSent ? [{ label: 'Delete for everyone', icon: <IoTrashBin />, onClick: handleDeleteForEveryone, danger: true }] : []),
  ];

  // Read status
  const readByOthers = message.readBy?.filter((id) => id !== user.uid).length > 0;

  return (
    <>
      <div
        className={`message-row ${isSent ? 'sent' : 'received'}`}
        onContextMenu={handleContextMenu}
      >
        <div className="message-bubble">
          {/* Actions trigger */}
          <button className="message-actions-trigger" onClick={handleActionClick}>
            <IoChevronDown />
          </button>

          {/* Group sender name */}
          {isGroup && !isSent && (
            <div className="message-sender-name">{message.senderName}</div>
          )}

          {/* Image message */}
          {message.type === 'image' && message.fileUrl && (
            <div className="message-image-wrapper" onClick={() => onImageClick(message.fileUrl)}>
              <img
                src={message.thumbnailUrl || message.fileUrl}
                alt="Shared image"
                loading="lazy"
              />
              <div className="message-image-overlay">
                <button
                  className="btn-icon"
                  style={{ color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(message.fileUrl, message.fileName);
                  }}
                >
                  <IoDownload size={18} />
                </button>
              </div>
            </div>
          )}

          {/* File message */}
          {message.type === 'file' && message.fileUrl && (
            <div className="file-message" onClick={() => handleDownload(message.fileUrl, message.fileName)}>
              <div className="file-message-icon">
                {getFileIcon(message.fileType)}
              </div>
              <div className="file-message-details">
                <div className="file-message-name">{message.fileName || 'Unknown file'}</div>
                <div className="file-message-size">{formatFileSize(message.fileSize)}</div>
              </div>
              <button className="file-message-download">
                <IoDownload size={16} />
              </button>
            </div>
          )}

          {/* Text */}
          {message.text && (
            <p className="message-text">{message.text}</p>
          )}

          {/* Meta */}
          <div className="message-meta">
            <span className="message-time">{formatMessageTime(message.timestamp)}</span>
            {isSent && (
              <span className={`message-status ${readByOthers ? 'read' : ''}`}>
                {readByOthers ? <IoCheckmarkDone size={14} /> : <IoCheckmark size={14} />}
              </span>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
