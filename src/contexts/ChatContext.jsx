import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

export function ChatProvider({ children }) {
  const [activeChat, setActiveChat] = useState(null);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const openChat = useCallback((chat) => {
    setActiveChat(chat);
    setShowChatInfo(false);
  }, []);

  const closeChat = useCallback(() => {
    setActiveChat(null);
    setShowChatInfo(false);
  }, []);

  const toggleChatInfo = useCallback(() => {
    setShowChatInfo((prev) => !prev);
  }, []);

  const value = {
    activeChat,
    setActiveChat,
    openChat,
    closeChat,
    showChatInfo,
    setShowChatInfo,
    toggleChatInfo,
    showNewChat,
    setShowNewChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
