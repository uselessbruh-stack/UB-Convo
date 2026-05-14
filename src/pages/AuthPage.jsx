import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="auth-page">
      {isSignup ? (
        <SignupForm onSwitch={() => setIsSignup(false)} />
      ) : (
        <LoginForm onSwitch={() => setIsSignup(true)} />
      )}
    </div>
  );
}
