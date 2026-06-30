import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import {
  Search,
  MessageSquarePlus,
  Moon,
  Sun,
  User,
  Users,
  Settings,
  X,
  Plus,
  Loader2,
  Pin,
  CheckCheck,
  Check,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user } = useAuth();
  const {
    chats,
    groups,
    activeChat,
    setActiveChat,
    setActiveChatType,
    fetchChats,
    fetchGroups,
    createGroup
  } = useChat();
  const { onlineUsers } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Group Create Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChats();
    fetchGroups();
  }, []);

  // Search users for starting 1-to-1 chats
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const { data } = await API.get(`/users?search=${searchQuery}`);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search users for group creation modal
  useEffect(() => {
    if (!showGroupModal) return;
    const delayDebounceFn = setTimeout(async () => {
      if (!groupSearchQuery) {
        setGroupSearchResults([]);
        return;
      }
      try {
        const { data } = await API.get(`/users?search=${groupSearchQuery}`);
        setGroupSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [groupSearchQuery, showGroupModal]);

  const handleStartChat = async (targetUser) => {
    try {
      const { data } = await API.post('/chats', { userId: targetUser._id });
      // Add to chats list if not already there
      fetchChats();
      setActiveChat(data);
      setActiveChatType('Chat');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      toast.error('Failed to open chat');
    }
  };

  const handleSelectChat = (chat, type) => {
    setActiveChat(chat);
    setActiveChatType(type);
  };

  const handleToggleMember = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleGroupAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupAvatar(file);
      setGroupAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupName) return toast.error('Group name is required');
    if (selectedMembers.length === 0) return toast.error('Select at least one member');

    setCreating(true);
    const result = await createGroup(groupName, groupDesc, selectedMembers, groupAvatar);
    setCreating(false);

    if (result) {
      setShowGroupModal(false);
      setGroupName('');
      setGroupDesc('');
      setGroupAvatar(null);
      setGroupAvatarPreview('');
      setSelectedMembers([]);
      setGroupSearchQuery('');
      setGroupSearchResults([]);
      
      // Select the new group
      setActiveChat(result);
      setActiveChatType('Group');
    }
  };

  // Date/Time Formatter
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderMessagePreview = (msg) => {
    if (!msg) return <span className="italic">No messages yet</span>;
    if (msg.isDeleted) return <span className="italic text-gray-400 dark:text-gray-500">This message was deleted</span>;

    const isSelf = msg.sender._id === user._id;
    const prefix = isSelf ? 'You: ' : '';

    if (msg.mediaType === 'image') {
      return (
        <span className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> Photo
        </span>
      );
    }
    if (msg.mediaType === 'pdf' || msg.mediaType === 'document') {
      return (
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> File
        </span>
      );
    }

    return `${prefix}${msg.content}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`flex h-full w-full flex-col border-r border-gray-200/50 bg-white dark:border-gray-800/50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 md:w-[350px] lg:w-[400px] shrink-0 transition-all ${activeChat ? 'hidden md:flex' : 'flex'}`}>
      
      {/* Top Header bar */}
      <div className="flex items-center justify-between bg-white/80 px-4 py-3.5 dark:bg-slate-900/80 border-b border-gray-100 dark:border-gray-800/60 sticky top-0 z-20 glass-header">
        {/* Rebranded Logo and Name */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white text-xs font-black shadow-sm transform hover:scale-105 transition-transform">
            Hi
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
            Convo<span className="logo-gradient-text">Hi</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Create Group Icon */}
          <button
            onClick={() => setShowGroupModal(true)}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Create Group"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
          
          {/* Light/Dark mode */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 theme-icon-rotate" /> : <Moon className="h-5 w-5 theme-icon-rotate" />}
          </button>

          {/* User profile avatar settings button */}
          <button
            onClick={() => navigate('/profile')}
            className="relative ml-1 rounded-full border border-gray-200/80 dark:border-gray-700 transition-transform hover:scale-105"
            title="Profile Settings"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white font-bold text-xs">
                {getInitials(user?.username)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-800 animate-pulse-glow" />
          </button>
        </div>
      </div>

      {/* Global User Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-gray-100/50 dark:border-gray-800/40">
        <div className="relative flex items-center rounded-xl bg-gray-50 px-3 py-2 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/80 focus-within:border-[#3B82F6] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-255 shadow-sm">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search users to start chatting..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute left-0 z-30 mt-2 w-full border border-gray-200/50 bg-white py-2 shadow-xl dark:border-gray-800/50 dark:bg-[#1f2c33] rounded-b-xl max-h-[300px] overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-chat-light-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map(u => (
                <button
                  key={u._id}
                  onClick={() => handleStartChat(u)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-[#2a3942]"
                >
                  {u.avatar ? (
                    <img src={u.avatar} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 text-white font-bold text-xs">
                      {getInitials(u.username)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{u.bio}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* Tabs Menu (Segmented Control) */}
      <div className="px-3.5 py-2 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800/40">
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'direct' ? 'bg-white dark:bg-slate-700 text-[#3B82F6] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <User className="h-4 w-4" />
            Chats
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'groups' ? 'bg-white dark:bg-slate-700 text-[#3B82F6] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-905 dark:hover:text-white'}`}
          >
            <Users className="h-4 w-4" />
            Groups
          </button>
        </div>
      </div>

      {/* Conversation Thread List Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
        {activeTab === 'direct' ? (
          // Direct 1-to-1 list
          chats.length > 0 ? (
            chats.map((c) => {
              const otherUser = c.participants.find(p => p._id !== user?._id) || {};
              const isActive = activeChat?._id === c._id;
              const isOnline = onlineUsers.includes(otherUser._id);
              const unreadCountObj = c.unreadCounts?.find(uc => uc.user === user?._id);
              const unreadCount = unreadCountObj ? unreadCountObj.count : 0;
              const isPinned = user?.pinnedChats?.includes(c._id);

              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectChat(c, 'Chat')}
                  className={`flex cursor-pointer items-center justify-between mx-2 my-1.5 px-3.5 py-3 rounded-xl transition-all duration-200 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 shadow-sm' : ''} animate-fade-in-up`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {otherUser.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.username}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-750"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-sm">
                          {getInitials(otherUser.username)}
                        </div>
                      )}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-[#111b21]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {otherUser.username}
                      </h4>
                      <p className={`text-xs truncate max-w-[200px] mt-0.5 ${unreadCount > 0 ? 'text-gray-955 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {renderMessagePreview(c.latestMessage)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatTime(c.latestMessage?.createdAt || c.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isPinned && <Pin className="h-3.5 w-3.5 rotate-45 text-gray-400 dark:text-gray-500 fill-current" />}
                      {unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-chat-light-primary dark:bg-chat-dark-primary px-1.5 text-[10px] font-bold text-white shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 h-40">
              <User className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">No active chats. Search users above to start chatting!</p>
            </div>
          )
        ) : (
          // Groups list
          groups.length > 0 ? (
            groups.map((g) => {
              const isActive = activeChat?._id === g._id;
              const unreadCountObj = g.unreadCounts?.find(uc => uc.user === user?._id);
              const unreadCount = unreadCountObj ? unreadCountObj.count : 0;
              const isPinned = user?.pinnedGroups?.includes(g._id);

              return (
                <div
                  key={g._id}
                  onClick={() => handleSelectChat(g, 'Group')}
                  className={`flex cursor-pointer items-center justify-between mx-2 my-1.5 px-3.5 py-3 rounded-xl transition-all duration-200 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 shadow-sm' : ''} animate-fade-in-up`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {g.avatar ? (
                        <img
                          src={g.avatar}
                          alt={g.name}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-750"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white font-bold text-sm">
                          {getInitials(g.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {g.name}
                      </h4>
                      <p className={`text-xs truncate max-w-[200px] mt-0.5 ${unreadCount > 0 ? 'text-gray-955 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {renderMessagePreview(g.latestMessage)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatTime(g.latestMessage?.createdAt || g.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isPinned && <Pin className="h-3.5 w-3.5 rotate-45 text-gray-400 dark:text-gray-500 fill-current" />}
                      {unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-chat-light-primary dark:bg-chat-dark-primary px-1.5 text-[10px] font-bold text-white shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 h-40">
              <Users className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">You are not in any group. Create one using the chat plus icon above!</p>
            </div>
          )
        )}
      </div>

      {/* Group Creation Wizard Overlay */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-250 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#1f2c33] text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
              <h3 className="text-lg font-bold">Create Group Chat</h3>
              <button onClick={() => setShowGroupModal(false)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              {/* Group avatar selection */}
              <div className="flex flex-col items-center justify-center">
                <label className="relative cursor-pointer group rounded-full border border-dashed border-gray-300 p-1">
                  {groupAvatarPreview ? (
                    <img src={groupAvatarPreview} className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500">
                      <Plus className="h-8 w-8" />
                    </div>
                  )}
                  <input type="file" onChange={handleGroupAvatarChange} accept="image/*" className="hidden" />
                </label>
                <span className="text-[10px] text-gray-400 mt-1">Group Avatar</span>
              </div>

              {/* Group input details */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border rounded-xl bg-gray-50 dark:bg-slate-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="Enter description (optional)"
                  value={groupDesc}
                  onChange={e => setGroupDesc(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border rounded-xl bg-gray-50 dark:bg-slate-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
                />
              </div>

              {/* Group member selector checkboxes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Invite Members ({selectedMembers.length})</label>
                <input
                  type="text"
                  placeholder="Search user to add..."
                  value={groupSearchQuery}
                  onChange={e => setGroupSearchQuery(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border rounded-xl bg-gray-50 dark:bg-slate-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
                />
                
                {/* Search result list */}
                {groupSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-800 rounded-xl max-h-32 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {groupSearchResults.map(u => {
                      const checked = selectedMembers.includes(u._id);
                      return (
                        <div
                          key={u._id}
                          onClick={() => handleToggleMember(u._id)}
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="text-sm font-semibold">{u.username}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="rounded accent-chat-light-primary dark:accent-chat-dark-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-chat-light-primary dark:bg-chat-dark-primary text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;