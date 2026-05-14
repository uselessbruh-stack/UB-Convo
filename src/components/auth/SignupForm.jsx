import { useState, useRef } from 'react';
import { IoEye, IoEyeOff, IoCamera } from 'react-icons/io5';
import { signUp, createUserDocument } from '../../services/authService';
import { checkUsernameAvailable } from '../../services/userService';
import { uploadProfilePicture } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { readFileAsDataURL } from '../../utils/fileUtils';
import Spinner from '../ui/Spinner';

export default function SignupForm({ onSwitch }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const usernameTimer = useRef(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === 'username') {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setForm((prev) => ({ ...prev, username: cleaned }));

      if (usernameTimer.current) clearTimeout(usernameTimer.current);

      if (cleaned.length < 3) {
        setUsernameStatus(null);
        return;
      }

      setUsernameStatus('checking');
      usernameTimer.current = setTimeout(async () => {
        const available = await checkUsernameAvailable(cleaned);
        setUsernameStatus(available ? 'available' : 'taken');
      }, 500);
    }
  };

  const handleProfilePic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setProfilePic(file);
    const preview = await readFileAsDataURL(file);
    setProfilePicPreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.username || !form.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Username is already taken');
      return;
    }

    setLoading(true);
    try {
      const user = await signUp(form.email, form.password, form.name);

      let profilePicUrl = null;
      if (profilePic) {
        profilePicUrl = await uploadProfilePicture(user.uid, profilePic);
      }

      await createUserDocument(user.uid, {
        name: form.name,
        email: form.email,
        username: form.username.toLowerCase(),
        profilePicUrl,
        phoneNumber: form.phoneNumber || null,
      });

      // Tell AuthContext to pick up the completed profile immediately
      await refreshProfile();
      toast.success('Account created successfully!');
    } catch (err) {
      const message = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists' :
        err.code === 'auth/weak-password' ? 'Password is too weak' :
          err.code === 'auth/invalid-email' ? 'Invalid email address' :
            'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>Join UB Convo</h1>
          <p>Create your account and start chatting</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="profile-avatar-upload">
            <div className="avatar-upload-circle" onClick={() => fileInputRef.current?.click()}>
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" />
              ) : (
                <IoCamera className="upload-icon" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePic}
              style={{ display: 'none' }}
            />
            <span className="avatar-upload-text">
              <span onClick={() => fileInputRef.current?.click()}>Upload</span> a profile picture
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="signup-name">Full Name *</label>
            <input
              id="signup-name"
              type="text"
              className="input-field"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-email">Email *</label>
            <input
              id="signup-email"
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-username">
              Username *
              {usernameStatus === 'checking' && <span style={{ color: 'var(--text-tertiary)', marginLeft: 8 }}>Checking...</span>}
              {usernameStatus === 'available' && <span style={{ color: 'var(--accent-success)', marginLeft: 8 }}>✓ Available</span>}
              {usernameStatus === 'taken' && <span style={{ color: 'var(--accent-danger)', marginLeft: 8 }}>✗ Taken</span>}
            </label>
            <input
              id="signup-username"
              type="text"
              className={`input-field ${usernameStatus === 'taken' ? 'error' : ''}`}
              placeholder="Choose a unique username"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-phone">Phone Number (optional)</label>
            <input
              id="signup-phone"
              type="tel"
              className="input-field"
              placeholder="Enter your phone number"
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-password">Password *</label>
            <div className="input-with-icon">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Create a password (min 6 chars)"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="signup-confirm">Confirm Password *</label>
            <input
              id="signup-confirm"
              type="password"
              className="input-field"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <button onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
