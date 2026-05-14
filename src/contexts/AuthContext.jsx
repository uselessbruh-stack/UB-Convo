import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthChange, checkProfileComplete } from '../services/authService';
import { getUserProfile, setUserOnline, setUserOffline } from '../services/userService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(null); // null = loading, true/false
  const checkAttemptRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      const currentAttempt = ++checkAttemptRef.current;

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Check profile status - retry up to 3 times with delay
          // This handles the race condition where signup creates the auth user
          // BEFORE the signup form writes the full user document to Firestore
          let result = await checkProfileComplete(firebaseUser.uid);

          // If doc doesn't exist yet, wait and retry (signup may still be writing)
          if (!result.exists) {
            await new Promise((r) => setTimeout(r, 2000));
            if (currentAttempt !== checkAttemptRef.current) return; // stale
            result = await checkProfileComplete(firebaseUser.uid);
          }

          // Guard against stale auth state callback
          if (currentAttempt !== checkAttemptRef.current) return;

          if (!result.exists || !result.complete) {
            setProfileComplete(false);
            setUserProfile(result.data || { name: firebaseUser.displayName || '', email: firebaseUser.email || '' });
          } else {
            setProfileComplete(true);
            const profile = await getUserProfile(firebaseUser.uid);
            if (currentAttempt !== checkAttemptRef.current) return;
            setUserProfile(profile);
            await setUserOnline(firebaseUser.uid).catch(() => {});
          }
        } catch (error) {
          if (error.name === 'AbortError') return;
          console.error('Error checking profile:', error);
          setProfileComplete(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setProfileComplete(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle visibility change for online/offline
  useEffect(() => {
    if (!user || !profileComplete) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserOffline(user.uid).catch(() => {});
      } else {
        setUserOnline(user.uid).catch(() => {});
      }
    };

    const handleBeforeUnload = () => {
      setUserOffline(user.uid).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setUserOffline(user.uid).catch(() => {});
    };
  }, [user, profileComplete]);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      setProfileComplete(profile?.profileCompleted || false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileComplete,
    setProfileComplete,
    setUserProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

