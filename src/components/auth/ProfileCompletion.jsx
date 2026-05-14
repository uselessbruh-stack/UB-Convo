import { useState, useRef } from 'react';
import { IoCamera, IoArrowForward, IoCheckmark } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { completeProfile, checkUsernameAvailable } from '../../services/userService';
import { uploadProfilePicture } from '../../services/storageService';
import { readFileAsDataURL } from '../../utils/fileUtils';
import Spinner from '../ui/Spinner';

export default function ProfileCompletion() {
  const { user, userProfile, refreshProfile } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: username, 2: profile pic, 3: phone
  const [username, setUsername] = useState(userProfile?.username || '');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(userProfile?.profilePicUrl || null);
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const fileInputRef = useRef(null);
  const usernameTimer = useRef(null);

  const handleUsernameChange = (value) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);

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
  };

  const handleProfilePic = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setProfilePic(file);
    const preview = await readFileAsDataURL(file);
    setProfilePicPreview(preview);
  };

  const handleComplete = async () => {
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (usernameStatus === 'taken') {
      toast.error('Username is already taken');
      return;
    }

    setLoading(true);
    try {
      let profilePicUrl = userProfile?.profilePicUrl || null;

      if (profilePic) {
        profilePicUrl = await uploadProfilePicture(user.uid, profilePic);
      }

      await completeProfile(user.uid, {
        username: username.toLowerCase(),
        profilePicUrl,
        phoneNumber: phoneNumber || null,
      });

      await refreshProfile();
      toast.success('Profile setup complete! Welcome to UB Convo.');
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!username || username.length < 3 || usernameStatus === 'taken')) {
      toast.error('Please enter a valid, available username');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  return (
    <div className="auth-page">
      <div className="auth-container profile-completion">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">💬</div>
            <h1>Complete Your Profile</h1>
            <p>
              {userProfile?.name ? `Welcome, ${userProfile.name}!` : 'Welcome!'} Let's set up your profile so others can find you.
            </p>
          </div>

          <div className="profile-completion-steps">
            <div className={`profile-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`} />
            <div className={`profile-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`} />
            <div className={`profile-step-dot ${step >= 3 ? 'active' : ''}`} />
          </div>

          {step === 1 && (
            <div className="animate-slide-up">
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>Choose a Username</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                This is how other users will find you. It must be unique.
              </p>
              <div className="input-group">
                <label htmlFor="pc-username">
                  Username
                  {usernameStatus === 'checking' && <span style={{ color: 'var(--text-tertiary)', marginLeft: 8 }}>Checking...</span>}
                  {usernameStatus === 'available' && <span style={{ color: 'var(--accent-success)', marginLeft: 8 }}>✓ Available</span>}
                  {usernameStatus === 'taken' && <span style={{ color: 'var(--accent-danger)', marginLeft: 8 }}>✗ Taken</span>}
                </label>
                <input
                  id="pc-username"
                  type="text"
                  className={`input-field ${usernameStatus === 'taken' ? 'error' : ''}`}
                  placeholder="e.g. john_doe"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Only lowercase letters, numbers, and underscores. Min 3 characters.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-primary" onClick={nextStep}>
                  Next <IoArrowForward />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>Add a Profile Picture</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                Help others recognize you. This step is optional but recommended!
              </p>

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
                <p className="avatar-upload-text">
                  <span onClick={() => fileInputRef.current?.click()}>Click to upload</span> or drag and drop
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button className="profile-skip-btn" onClick={() => setStep(3)}>
                  Skip for now
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Next <IoArrowForward />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>Phone Number (Optional)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                Add your phone number so friends can easily reach you. You can control who sees it in privacy settings.
              </p>
              <div className="input-group">
                <label htmlFor="pc-phone">Phone Number</label>
                <input
                  id="pc-phone"
                  type="tel"
                  className="input-field"
                  placeholder="e.g. +1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button className="profile-skip-btn" onClick={handleComplete} disabled={loading}>
                  Skip
                </button>
                <button className="btn btn-primary" onClick={handleComplete} disabled={loading}>
                  {loading ? <Spinner size="sm" /> : <><IoCheckmark /> Complete Setup</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
