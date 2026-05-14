import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import ProfileCompletion from './components/auth/ProfileCompletion';
import ToastContainer from './components/ui/Toast';
import Spinner from './components/ui/Spinner';

export default function App() {
  const { user, loading, profileComplete } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, #a78bfa 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: '0 4px 20px rgba(124, 108, 240, 0.35)'
        }}>💬</div>
        <span className="app-name">UB Convo</span>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  if (!profileComplete) {
    return (
      <>
        <ProfileCompletion />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <ChatPage />
      <ToastContainer />
    </>
  );
}
