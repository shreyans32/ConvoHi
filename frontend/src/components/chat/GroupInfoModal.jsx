import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import API from '../../services/api';
import { X, Camera, Plus, UserMinus, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
const GroupInfoModal = ({ onClose }) => {
  const { user } = useAuth();
  const { activeChat, updateGroupInfo, setGroups, setActiveChat } = useChat();
  const [name, setName] = useState(activeChat?.name || '');
  const [description, setDescription] = useState(activeChat?.description || '');
  const [avatarPreview, setAvatarPreview] = useState(activeChat?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  // Search members to add
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const isAdmin = activeChat?.admins?.some(adminId => 
    (adminId._id || adminId) === user._id
  );
  
  const isCreator = (activeChat?.creator?._id || activeChat?.creator) === user._id;
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setUpdating(true);
    await updateGroupInfo(activeChat._id, name, description, avatarFile);
    setUpdating(false);
  };
  const handleSearchUsers = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await API.get(`/users?search=${query}`);
      const filtered = data.filter(u => 
        !activeChat.members.some(m => (m._id || m) === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddMember = async (targetUserId) => {
    setAddingMember(true);
    try {
      const { data } = await API.put(`/groups/${activeChat._id}/add`, { userId: targetUserId });
      setActiveChat(data);
      setGroups(prev => prev.map(g => g._id === data._id ? data : g));
      toast.success('Member added successfully');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };
  const handleRemoveMember = async (targetUserId) => {
    try {
      const { data } = await API.put(`/groups/${activeChat._id}/remove`, { userId: targetUserId });
      setActiveChat(data);
      setGroups(prev => prev.map(g => g._id === data._id ? data : g));
      toast.success('Member removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };
  const handleLeaveGroup = async () => {
    if (isCreator) {
      toast.error('As creator, you cannot leave the group. Delete it instead.');
      return;
    }
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await API.put(`/groups/${activeChat._id}/remove`, { userId: user._id });
      setGroups(prev => prev.filter(g => g._id !== activeChat._id));
      setActiveChat(null);
      toast.success('You left the group');
      onClose();
    } catch (err) {
      toast.error('Failed to leave group');
    }
  };
  const getInitials = (gName) => {
    if (!gName) return 'G';
    return gName.slice(0, 2).toUpperCase();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200/50 bg-white shadow-2xl dark:border-gray-800/50 dark:bg-[#1f2c33] text-gray-900 dark:text-gray-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-850">
          <h3 className="text-lg font-bold">Group Info</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-col items-center gap-3">
            <label className="relative cursor-pointer group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Group"
                  className="h-24 w-24 rounded-full object-cover border-2 border-chat-light-primary dark:border-chat-dark-primary shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-white font-extrabold text-3xl border-2 border-teal-500 shadow-md">
                  {getInitials(activeChat?.name)}
                </div>
              )}
              {isAdmin && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
              <input type="file" onChange={handleAvatarChange} disabled={!isAdmin} accept="image/*" className="hidden" />
            </label>
          </div>
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-505 uppercase">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={!isAdmin}
                className="w-full mt-1 px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-505 uppercase">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={!isAdmin}
                rows={2}
                className="w-full mt-1 px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
              />
            </div>
            {isAdmin && (
              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-chat-light-primary dark:bg-chat-dark-primary text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {updating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Save Details'}
              </button>
            )}
          </form>
          <hr className="border-gray-200 dark:border-gray-800" />
          {/* Admin Tools: Add Member */}
          {isAdmin && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase text-gray-500">Add Member</h4>
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={handleSearchUsers}
                className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-805 dark:border-gray-700 outline-none focus:ring-1 focus:ring-chat-light-primary"
              />
              {searchResults.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {searchResults.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        {u.avatar ? (
                          <img src={u.avatar} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-xs">
                            {u.username[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium">{u.username}</span>
                      </div>
                      <button
                        onClick={() => handleAddMember(u._id)}
                        disabled={addingMember}
                        className="p-1.5 rounded-full bg-chat-light-primary/10 hover:bg-chat-light-primary text-chat-light-primary hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Members List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase text-gray-500 flex justify-between">
              <span>Members</span>
              <span>{activeChat?.members?.length || 0}</span>
            </h4>
            <div className="space-y-3">
              {activeChat?.members?.map(m => {
                const isMemberAdmin = activeChat.admins.some(adminId => 
                  (adminId._id || adminId) === m._id
                );
                const isMemberCreator = (activeChat.creator?._id || activeChat.creator) === m._id;
                
                return (
                  <div key={m._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {m.avatar ? (
                        <img src={m.avatar} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">
                          {m.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{m.username}</p>
                        <p className="text-xs text-gray-500">{m.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMemberCreator && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          Owner
                        </span>
                      )}
                      {isMemberAdmin && !isMemberCreator && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chat-light-primary/10 text-chat-light-primary border border-chat-light-primary/30">
                          Admin
                        </span>
                      )}
                      
                      {isAdmin && m._id !== user._id && !isMemberCreator && (
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                          title="Remove Member"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          {!isCreator && (
            <button
              onClick={handleLeaveGroup}
              className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl border border-red-500/30 transition"
            >
              <LogOut className="h-4 w-4" />
              Leave Group
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default GroupInfoModal;
