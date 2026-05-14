import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useToast } from '../../contexts/ToastContext';
import { subscribeToMessages, markMessageRead } from '../../services/messageService';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ImagePreview from './ImagePreview';
import { IoChatbubbleEllipses, IoChevronDown } from 'react-icons/io5';
import { formatDateSeparator } from '../../utils/formatTime';

export default function ChatWindow() {
  const { user, userProfile } = useAuth();
  const { activeChat } = useChat();
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // Subscribe to messages
  useEffect(() => {
    if (!activeChat?.id) return;

    setLoading(true);
    setMessages([]);

    const unsubscribe = subscribeToMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
      setLoading(false);

      // Mark messages as read
      msgs.forEach((msg) => {
        if (msg.senderId !== user.uid && !msg.readBy?.includes(user.uid) && !msg.isDeleted) {
          markMessageRead(activeChat.id, msg.id, user.uid).catch(() => {});
        }
      });
    }, 200);

    return () => unsubscribe();
  }, [activeChat?.id, user?.uid]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const getDateKey = (msg) => {
    if (!msg.timestamp) return 'Sending...';
    const date = msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
    return date.toDateString();
  };

  if (!activeChat) {
    return (
      <div className="chat-main">
        <div className="empty-chat-state">
          <div className="empty-chat-icon">
            <IoChatbubbleEllipses />
          </div>
          <h2>Welcome to UB Convo</h2>
          <p>
            Select a conversation from the sidebar or start a new one.
            Keep your conversations organized and stay connected!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main">
      <ChatHeader chat={activeChat} currentUserId={user.uid} />

      <div
        className="messages-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, flex: 1, justifyContent: 'flex-end' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start', width: '40%' }}>
                <div className="skeleton" style={{ height: 48, borderRadius: 16 }} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat-state" style={{ flex: 1 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>👋</div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>No messages yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Send a message to start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              // Check if we need a date separator
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDate = !prevMsg || getDateKey(msg) !== getDateKey(prevMsg);
              const isSent = msg.senderId === user.uid;
              const isDeleted = msg.deletedFor?.includes(user.uid);

              if (isDeleted) return null;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="date-separator">
                      <span>{formatDateSeparator(msg.timestamp)}</span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isSent={isSent}
                    isGroup={activeChat.type === 'group'}
                    chatId={activeChat.id}
                    onImageClick={(url) => setPreviewImage(url)}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {showScrollBtn && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          <IoChevronDown />
        </button>
      )}

      <MessageInput
        chatId={activeChat.id}
        currentUser={{ id: user.uid, name: userProfile?.name }}
      />

      {previewImage && (
        <ImagePreview
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
