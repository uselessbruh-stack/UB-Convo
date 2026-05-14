import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';

import './styles/index.css';
import './styles/animations.css';
import './styles/auth.css';
import './styles/chat.css';
import './styles/settings.css';

// Suppress harmless AbortError from Firestore listener teardown
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.name === 'AbortError') {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);
