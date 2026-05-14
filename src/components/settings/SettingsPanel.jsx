import { useState, useRef } from 'react';
import {
  IoArrowBack, IoPersonCircle, IoColorPalette, IoLockClosed,
  IoNotifications, IoInformationCircle, IoCamera
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { updateUserProfile, updateUserSettings } from '../../services/userService';
import { uploadProfilePicture } from '../../services/storageService';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: <IoPersonCircle /> },
  { id: 'theme', label: 'Appearance', icon: <IoColorPalette /> },
  { id: 'privacy', label: 'Privacy', icon: <IoLockClosed /> },
  { id: 'notifications', label: 'Notifications', icon: <IoNotifications /> },
  { id: 'about', label: 'About', icon: <IoInformationCircle /> },
];

export default function SettingsPanel({ onClose }) {
  const { user, userProfile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    username: userProfile?.username || '',
    phoneNumber: userProfile?.phoneNumber || '',
  });
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  // Settings state
  const [settings, setSettings] = useState(userProfile?.settings || {
    showEmail: false,
    showPhone: false,
    readReceipts: true,
    notifications: true,
    notificationSound: true,
    lastActiveStatus: true,
  });

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploadingPic(true);
    try {
      const url = await uploadProfilePicture(user.uid, file);
      await updateUserProfile(user.uid, { profilePicUrl: url });
      await refreshProfile();
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
    setUploadingPic(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber || null,
      });
      await refreshProfile();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleSettingToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await updateUserSettings(user.uid, newSettings);
    } catch {
      setSettings(settings); // rollback
      toast.error('Failed to update setting');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section animate-slide-up" key="profile">
            <h2 className="settings-section-title">Profile</h2>
            <p className="settings-section-subtitle">Manage your personal information</p>

            <div className="profile-settings-header">
              <div className="profile-avatar-edit" onClick={() => fileInputRef.current?.click()}>
                <Avatar src={userProfile?.profilePicUrl} name={userProfile?.name} size="3xl" />
                <div className="profile-avatar-edit-overlay">
                  {uploadingPic ? <Spinner size="md" /> : <IoCamera />}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicChange} style={{ display: 'none' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{userProfile?.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>@{userProfile?.username}</div>
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card-title">Personal Info</div>
              <div className="profile-form">
                <div className="input-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profileForm.username}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Username cannot be changed</span>
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={userProfile?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Add phone number"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Spinner size="sm" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="settings-section animate-slide-up" key="theme">
            <h2 className="settings-section-title">Appearance</h2>
            <p className="settings-section-subtitle">Customize the look and feel</p>

            <div className="settings-card">
              <div className="settings-card-title">Theme</div>
              <div className="theme-options">
                <div
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="theme-option-preview theme-dark">
                    <div className="preview-sidebar" />
                    <div className="preview-main" />
                  </div>
                  <span className="theme-option-label">Dark</span>
                </div>
                <div
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <div className="theme-option-preview theme-light">
                    <div className="preview-sidebar" />
                    <div className="preview-main" />
                  </div>
                  <span className="theme-option-label">Light</span>
                </div>
                <div
                  className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <div className="theme-option-preview theme-system">
                    <div className="preview-sidebar" />
                    <div className="preview-main" />
                  </div>
                  <span className="theme-option-label">System</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section animate-slide-up" key="privacy">
            <h2 className="settings-section-title">Privacy</h2>
            <p className="settings-section-subtitle">Control who can see your information</p>

            <div className="settings-card">
              <div className="settings-card-title">Visibility</div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Show Email</div>
                  <div className="settings-row-description">Allow others to see your email address</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.showEmail} onChange={() => handleSettingToggle('showEmail')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Show Phone Number</div>
                  <div className="settings-row-description">Allow others to see your phone number</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.showPhone} onChange={() => handleSettingToggle('showPhone')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Last Active Status</div>
                  <div className="settings-row-description">Show when you were last active</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.lastActiveStatus} onChange={() => handleSettingToggle('lastActiveStatus')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Read Receipts</div>
                  <div className="settings-row-description">Let others know when you've read their messages</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.readReceipts} onChange={() => handleSettingToggle('readReceipts')} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section animate-slide-up" key="notifications">
            <h2 className="settings-section-title">Notifications</h2>
            <p className="settings-section-subtitle">Manage how you receive notifications</p>

            <div className="settings-card">
              <div className="settings-card-title">Preferences</div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Push Notifications</div>
                  <div className="settings-row-description">Receive notifications for new messages</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.notifications} onChange={() => handleSettingToggle('notifications')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Notification Sounds</div>
                  <div className="settings-row-description">Play a sound for incoming messages</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.notificationSound} onChange={() => handleSettingToggle('notificationSound')} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="settings-section animate-slide-up" key="about">
            <h2 className="settings-section-title">About</h2>
            <p className="settings-section-subtitle">Application information</p>

            <div className="settings-card">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #a78bfa 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(124, 108, 240, 0.35)'
                }}>💬</div>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>UB Convo</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Version 1.0.0</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
                  A real-time chat application built with React and Firebase.
                  <br />Stay connected with friends and groups.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <div className="settings-sidebar-header">
          <button className="btn-icon" onClick={onClose}>
            <IoArrowBack size={20} />
          </button>
          <h2>Settings</h2>
        </div>
        <nav className="settings-nav">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="settings-content">
        {renderContent()}
      </div>
    </div>
  );
}
