import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, User, FileText, Lock, Camera, Sun, Moon, LogOut, Loader2 } from 'lucide-react';
const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  // Generate initials fallback if no avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleTriggerUpload = () => {
    fileInputRef.current.click();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (password) formData.append('password', password);
    if (avatarFile) formData.append('avatar', avatarFile);
    const success = await updateProfile(formData);
    setUpdating(false);
    if (success) {
      setPassword('');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/50 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Light/Dark mode */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-full p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      {/* Profile Form */}
      <main className="mx-auto max-w-2xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-32 w-32 rounded-full object-cover border-4 border-chat-light-primary dark:border-chat-dark-primary shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white text-4xl font-extrabold border-4 border-chat-light-primary dark:border-chat-dark-primary shadow-lg">
                  {getInitials(user?.username)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user?.username}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-5 rounded-2xl border border-gray-200/50 bg-white p-6 shadow-md dark:border-gray-800/50 dark:bg-gray-900">
            {/* Username field */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Username
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-chat-light-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-chat-light-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-chat-dark-primary dark:focus:bg-gray-900 dark:focus:ring-chat-dark-primary"
                />
              </div>
            </div>
            {/* Bio Field */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Bio
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pt-3.5 text-gray-400">
                  <FileText className="h-5 w-5" />
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-chat-light-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-chat-light-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-chat-dark-primary dark:focus:bg-gray-900 dark:focus:ring-chat-dark-primary"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            {/* Password field */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                New Password (Optional)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-chat-light-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-chat-light-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-chat-dark-primary dark:focus:bg-gray-900 dark:focus:ring-chat-dark-primary"
                  placeholder="Enter a new password"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 flex justify-center items-center rounded-xl bg-chat-light-primary dark:bg-chat-dark-primary py-3 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
export default Profile;
