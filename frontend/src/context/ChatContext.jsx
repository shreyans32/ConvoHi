import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Can be Chat or Group object
  const [activeChatType, setActiveChatType] = useState(null); // 'Chat' or 'Group'
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { [chatId]: [username1, username2] }
  const [notifications, setNotifications] = useState([]);
  // Fetch all 1-to-1 chats
  const fetchChats = async () => {
    try {
      const { data } = await API.get('/chats');
      setChats(data);
    } catch (err) {
      console.error('Fetch chats error:', err);
    }
  };
  // Fetch all group chats
  const fetchGroups = async () => {
    try {
      const { data } = await API.get('/groups');
      setGroups(data);
    } catch (err) {
      console.error('Fetch groups error:', err);
    }
  };
  // Fetch messages for active chat
  const fetchMessages = async (chatType, chatId) => {
    try {
      const { data } = await API.get(`/messages/${chatType}/${chatId}`);
      setMessages(data);
      
      // Reset unread count locally for this chat
      if (chatType === 'Chat') {
        setChats(prev => prev.map(c => c._id === chatId ? {
          ...c,
          unreadCounts: c.unreadCounts.map(uc => uc.user === user._id ? { ...uc, count: 0 } : uc)
        } : c));
      } else {
        setGroups(prev => prev.map(g => g._id === chatId ? {
          ...g,
          unreadCounts: g.unreadCounts.map(uc => uc.user === user._id ? { ...uc, count: 0 } : uc)
        } : g));
      }
      // Notify other user via socket that we read messages
      if (socket) {
        socket.emit('message_seen', { chatId, userId: user._id, chatType });
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };
  // Send message
  const sendMessage = async (content, file, replyToId) => {
    if (!activeChat) return;
    try {
      const formData = new FormData();
      formData.append('chatId', activeChat._id);
      formData.append('chatType', activeChatType);
      
      if (content) formData.append('content', content);
      if (file) formData.append('file', file);
      if (replyToId) formData.append('replyTo', replyToId);
      const { data } = await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Add to messages list
      setMessages(prev => [...prev, data]);
      // Emit new message through socket
      if (socket) {
        socket.emit('new_message', data);
      }
      // Update chats/groups latestMessage locally
      updateLatestMessageState(data);
    } catch (err) {
      toast.error('Failed to send message');
      console.error(err);
    }
  };
  const updateLatestMessageState = (msg) => {
    const chatId = typeof msg.chat === 'object' ? msg.chat._id : msg.chat;
    if (msg.chatType === 'Chat') {
      setChats(prev => {
        const list = prev.map(c => c._id === chatId ? { ...c, latestMessage: msg } : c);
        return list.sort((a, b) => new Date(b.latestMessage?.createdAt || b.updatedAt) - new Date(a.latestMessage?.createdAt || a.updatedAt));
      });
    } else {
      setGroups(prev => {
        const list = prev.map(g => g._id === chatId ? { ...g, latestMessage: msg } : g);
        return list.sort((a, b) => new Date(b.latestMessage?.createdAt || b.updatedAt) - new Date(a.latestMessage?.createdAt || a.updatedAt));
      });
    }
  };
  // Edit Message
  const editMessage = async (msgId, newContent) => {
    try {
      const { data } = await API.put(`/messages/${msgId}`, { content: newContent });
      setMessages(prev => prev.map(m => m._id === msgId ? data : m));
      if (socket) socket.emit('message_edited', data);
    } catch (err) {
      toast.error('Failed to edit message');
    }
  };
  // Delete Message
  const deleteMessage = async (msgId) => {
    try {
      const { data } = await API.delete(`/messages/${msgId}`);
      setMessages(prev => prev.map(m => m._id === msgId ? {
        ...m,
        isDeleted: true,
        content: 'This message was deleted',
        mediaUrl: '',
        fileName: '',
        fileSize: 0,
        mediaType: ''
      } : m));
      if (socket) socket.emit('message_deleted', data);
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };
  // React to Message
  const reactMessage = async (msgId, emoji) => {
    try {
      const { data } = await API.post(`/messages/${msgId}/react`, { emoji });
      setMessages(prev => prev.map(m => m._id === msgId ? data : m));
      if (socket) socket.emit('message_reacted', data);
    } catch (err) {
      toast.error('Failed to react to message');
    }
  };
  // Pin Message
  const togglePinMessage = async (msgId) => {
    try {
      const { data } = await API.put(`/messages/${msgId}/pin`);
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, pinned: data.pinned } : m));
    } catch (err) {
      toast.error('Failed to pin message');
    }
  };
  // Create Group
  const createGroup = async (name, description, members, file) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description || '');
      formData.append('members', JSON.stringify(members));
      if (file) formData.append('avatar', file);
      const { data } = await API.post('/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGroups(prev => [data, ...prev]);
      toast.success(`Group "${name}" created!`);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create group';
      toast.error(errMsg);
      return null;
    }
  };
  // Update Group Info
  const updateGroupInfo = async (groupId, name, description, file) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description || '');
      if (file) formData.append('avatar', file);
      const { data } = await API.put(`/groups/${groupId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGroups(prev => prev.map(g => g._id === groupId ? data : g));
      if (activeChat?._id === groupId) setActiveChat(data);
      toast.success('Group updated successfully');
    } catch (err) {
      toast.error('Failed to update group');
    }
  };
  // Join Active Chat room in socket
  useEffect(() => {
    if (!socket || !activeChat) return;
    socket.emit('join_chat', activeChat._id);
    return () => {
      socket.emit('leave_chat', activeChat._id);
    };
  }, [socket, activeChat]);
  // Handle Socket Events for messaging
  useEffect(() => {
    if (!socket || !user) return;
    const handleMessageReceived = (newMessage) => {
      const activeId = activeChat?._id;
      const msgChatId = typeof newMessage.chat === 'object' ? newMessage.chat._id : newMessage.chat;
      if (activeId === msgChatId) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        socket.emit('message_seen', { chatId: activeId, userId: user._id, chatType: activeChatType });
      } else {
        // Increment unread count in parent chats/groups
        if (newMessage.chatType === 'Chat') {
          setChats(prev => prev.map(c => {
            if (c._id === msgChatId) {
              const ucs = c.unreadCounts.map(uc => uc.user === user._id ? { ...uc, count: uc.count + 1 } : uc);
              return { ...c, latestMessage: newMessage, unreadCounts: ucs };
            }
            return c;
          }));
        } else {
          setGroups(prev => prev.map(g => {
            if (g._id === msgChatId) {
              const ucs = g.unreadCounts.map(uc => uc.user === user._id ? { ...uc, count: uc.count + 1 } : uc);
              return { ...g, latestMessage: newMessage, unreadCounts: ucs };
            }
            return g;
          }));
        }
      }
      updateLatestMessageState(newMessage);
    };
    const handleMessageSeen = ({ chatId, userId }) => {
      if (activeChat?._id === chatId) {
        setMessages(prev => prev.map(m => {
          if (m.sender._id !== userId && !m.readBy.some(r => r.user === userId)) {
            return { ...m, readBy: [...m.readBy, { user: userId, readAt: new Date() }] };
          }
          return m;
        }));
      }
    };
    const handleMessageReacted = (updatedMessage) => {
      const activeId = activeChat?._id;
      const msgChatId = typeof updatedMessage.chat === 'object' ? updatedMessage.chat._id : updatedMessage.chat;
      if (activeId === msgChatId) {
        setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
      }
    };
    const handleMessageEdited = (updatedMessage) => {
      const activeId = activeChat?._id;
      const msgChatId = typeof updatedMessage.chat === 'object' ? updatedMessage.chat._id : updatedMessage.chat;
      if (activeId === msgChatId) {
        setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
      }
    };
    const handleMessageDeleted = (deletedMessage) => {
      const activeId = activeChat?._id;
      const msgChatId = typeof deletedMessage.chat === 'object' ? deletedMessage.chat._id : deletedMessage.chat;
      if (activeId === msgChatId) {
        setMessages(prev => prev.map(m => m._id === deletedMessage._id ? {
          ...m,
          isDeleted: true,
          content: 'This message was deleted',
          mediaUrl: '',
          fileName: '',
          fileSize: 0,
          mediaType: ''
        } : m));
      }
    };
    const handleTyping = ({ room, user: typingUser }) => {
      if (typingUser._id === user._id) return;
      setTypingUsers(prev => {
        const roomTyping = prev[room] || [];
        if (!roomTyping.includes(typingUser.username)) {
          return { ...prev, [room]: [...roomTyping, typingUser.username] };
        }
        return prev;
      });
    };
    const handleStopTyping = ({ room, user: typingUser }) => {
      setTypingUsers(prev => {
        const roomTyping = prev[room] || [];
        return { ...prev, [room]: roomTyping.filter(u => u !== typingUser.username) };
      });
    };
    socket.on('message_received', handleMessageReceived);
    socket.on('message_seen', handleMessageSeen);
    socket.on('message_reacted', handleMessageReacted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('message_seen', handleMessageSeen);
      socket.off('message_reacted', handleMessageReacted);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, activeChat, user]);
  return (
    <ChatContext.Provider value={{
      chats,
      groups,
      activeChat,
      activeChatType,
      messages,
      typingUsers,
      notifications,
      setActiveChat,
      setActiveChatType,
      fetchChats,
      fetchGroups,
      fetchMessages,
      sendMessage,
      editMessage,
      deleteMessage,
      reactMessage,
      togglePinMessage,
      createGroup,
      updateGroupInfo,
      setChats,
      setGroups,
      setMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};
export const useChat = () => useContext(ChatContext);
