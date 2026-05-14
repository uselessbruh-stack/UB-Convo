import { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInfoPanel from '../components/chat/ChatInfoPanel';
import NewChatModal from '../components/chat/NewChatModal';
import SettingsPanel from '../components/settings/SettingsPanel';

export default function ChatPage() {
  const { activeChat, showNewChat, showChatInfo } = useChat();
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className={`app-layout ${activeChat ? 'chat-active' : ''}`}>
      <Sidebar onSettingsClick={() => setShowSettings(true)} />
      <ChatWindow />
      {showChatInfo && <ChatInfoPanel />}
      {showNewChat && <NewChatModal />}
    </div>
  );
}
