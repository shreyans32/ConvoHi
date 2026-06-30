import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';
import {
  ArrowLeft,
  Info,
  Search,
  Paperclip,
  Smile,
  Send,
  Loader2,
  X,
  FileText,
  CornerUpLeft,
  Edit3,
  Trash2,
  Pin,
  Check,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Placeholder from './Placeholder';
const ChatWindow = ({ onOpenGroupInfo }) => {
  const { user } = useAuth();
  const {
    activeChat,
    activeChatType,
    messages,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    reactMessage,
    togglePinMessage,
    fetchMessages,
    setActiveChat
  } = useChat();
  const { socket, onlineUsers } = useSocket();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  // Chat message search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Editing Message
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  // Dropdowns for message actions
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // Typing debounce timer
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  // Fetch messages whenever active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChatType, activeChat._id);
      setInputText('');
      setSelectedFile(null);
      setFilePreviewUrl('');
      setReplyMessage(null);
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [activeChat, activeChatType]);
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);
  // Typing indicators logic
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!socket || !activeChat) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { room: activeChat._id, user });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { room: activeChat._id, user });
    }, 2500);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(''); // No image preview for PDFs/Docs
      }
    }
  };
  const handleTriggerFile = () => {
    fileInputRef.current.click();
  };
  const handleEmojiClick = (emojiData) => {
    setInputText(prev => prev + emojiData.emoji);
  };
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;
    // Send stop typing signal immediately
    if (socket && activeChat) {
      setIsTyping(false);
      socket.emit('stop_typing', { room: activeChat._id, user });
    }
    const textToSend = inputText;
    const fileToSend = selectedFile;
    const replyId = replyMessage?._id;
    // Reset local inputs first for snappy feel
    setInputText('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    setReplyMessage(null);
    setShowEmojiPicker(false);
    await sendMessage(textToSend, fileToSend, replyId);
  };
  const handleEditSubmit = async (msgId) => {
    if (!editText.trim()) return;
    await editMessage(msgId, editText);
    setEditingMessageId(null);
    setEditText('');
    setActiveMenuId(null);
  };
  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.content);
    setActiveMenuId(null);
  };
  // Filter messages based on search query
  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;
  const getOtherParticipant = () => {
    if (activeChatType === 'Group') return null;
    return activeChat?.participants?.find(p => p._id !== user._id) || {};
  };
  const formatMessageTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };
  return (
    <div className={`flex h-full flex-1 flex-col bg-slate-50 dark:bg-slate-950 bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-[#0f172a]/30 dark:to-[#090d16]/30 transition-all relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
      
      {/* Header */}
      {activeChat ? (
        <>
          <header className="z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 text-gray-900 dark:text-gray-100 sticky top-0 glass-header">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveChat(null)}
                className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative shrink-0">
                {activeChatType === 'Chat' ? (
                  getOtherParticipant().avatar ? (
                    <img src={getOtherParticipant().avatar} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white font-bold text-sm">
                      {getInitials(getOtherParticipant().username)}
                    </div>
                  )
                ) : (
                  activeChat.avatar ? (
                    <img src={activeChat.avatar} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-sm">
                      {getInitials(activeChat.name)}
                    </div>
                  )
                )}
                {activeChatType === 'Chat' && onlineUsers.includes(getOtherParticipant()._id) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900 animate-pulse-glow" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold truncate text-gray-900 dark:text-white">
                  {activeChatType === 'Chat' ? getOtherParticipant().username : activeChat.name}
                </h3>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold truncate mt-0.5">
                  {activeChatType === 'Chat' ? (
                    onlineUsers.includes(getOtherParticipant()._id) ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span>Offline</span>
                    )
                  ) : (
                    <span>{activeChat?.members?.length || 0} members</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                title="Search Messages"
              >
                <Search className="h-5 w-5" />
              </button>
              {activeChatType === 'Group' && (
                <button
                  onClick={onOpenGroupInfo}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  title="Group Info"
                >
                  <Info className="h-5 w-5" />
                </button>
              )}
            </div>
          </header>
          {/* Search Message Box */}
          {showSearch && (
            <div className="z-10 flex items-center bg-white px-4 py-2 dark:bg-[#1f2c33] border-b border-gray-200 dark:border-gray-800 animate-slide-down">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search text in messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none dark:text-white"
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {/* Pinned Messages Header (if any exist) */}
          {messages.some(m => m.pinned) && (
            <div className="z-10 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 border-b border-yellow-100 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-400 font-medium">
              <Pin className="h-3.5 w-3.5 rotate-45 shrink-0" />
              <span className="truncate">
                Pinned: {messages.filter(m => m.pinned).map(m => m.content).join(', ')}
              </span>
            </div>
          )}
          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {filteredMessages.map((msg) => {
              const isSelf = msg.sender._id === user._id;
              const hasReactions = msg.reactions?.length > 0;
              const isMenuOpen = activeMenuId === msg._id;
              return (
                <div
                      key={msg._id}
                      onMouseEnter={() => setHoveredMessageId(msg._id)}
                      onMouseLeave={() => { setHoveredMessageId(null); setActiveMenuId(null); }}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} relative group/msg animate-fade-in-up`}
                    >
                  
                  {/* Sender name for group chats */}
                  {activeChatType === 'Group' && !isSelf && (
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mb-0.5 ml-1">
                      {msg.sender.username}
                    </span>
                  )}
                  {/* Message Bubble wrapper */}
                  <div className="flex items-start gap-1 max-w-[85%] md:max-w-[70%]">
                    
                    {/* Message Bubble content */}
                    <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm relative border hover:shadow-md transition-shadow duration-205 ${
                            isSelf
                              ? 'bg-chat-light-bubbleSelf dark:bg-chat-dark-bubbleSelf text-gray-900 dark:text-gray-100 rounded-tr-none border-blue-100/30 dark:border-blue-900/20'
                              : 'bg-chat-light-bubbleOther dark:bg-chat-dark-bubbleOther text-gray-900 dark:text-gray-100 rounded-tl-none border-gray-100 dark:border-slate-850/60'
                          }`}
                        >
                      {/* Reply preview inside bubble */}
                      {msg.replyTo && (
                        <div className="border-l-4 border-chat-light-primary dark:border-chat-dark-primary bg-black/5 dark:bg-white/5 pl-2 py-1 pr-1.5 rounded text-[11px] mb-2 text-gray-500 dark:text-gray-400 truncate max-w-full">
                          <span className="font-bold block text-chat-light-primary">
                            {msg.replyTo.sender?.username || 'User'}
                          </span>
                          {msg.replyTo.content || 'Attachment'}
                        </div>
                      )}
                      {/* Editing panel */}
                      {editingMessageId === msg._id ? (
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                          <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full px-2 py-1 border rounded bg-white text-sm dark:bg-gray-800 dark:border-gray-700 outline-none text-gray-900 dark:text-white"
                          />
                          <div className="flex justify-end gap-1.5 text-xs font-semibold">
                            <button onClick={() => setEditingMessageId(null)} className="text-gray-500 hover:underline">Cancel</button>
                            <button onClick={() => handleEditSubmit(msg._id)} className="text-chat-light-primary hover:underline">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Media attachments */}
                          {msg.mediaUrl && (
                            <div className="mb-2">
                              {msg.mediaType === 'image' ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="Attachment"
                                  className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-95 shadow-sm border border-gray-200 dark:border-gray-800"
                                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900"
                                >
                                  <FileText className="h-8 w-8 text-chat-light-primary dark:text-chat-dark-primary" />
                                  <div className="text-left min-w-0">
                                    <p className="text-xs font-bold truncate max-w-[150px]">{msg.fileName || 'Attachment'}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                      {msg.fileSize ? `${(msg.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}
                                    </p>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                          {/* Text content */}
                          <p className="break-words leading-relaxed">{msg.content}</p>
                        </>
                      )}
                      {/* Seen receipts and timestamp */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                        {msg.isEdited && <span className="italic mr-1 text-[8px]">edited</span>}
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isSelf && (
                          msg.readBy?.length > 1 ? (
                            <CheckCheck className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-gray-400" />
                          )
                        )}
                      </div>
                      {/* Display message reactions overlay */}
                      {hasReactions && (
                        <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs shadow-md border border-gray-150 dark:border-gray-700 select-none">
                          {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                            <span key={emoji}>{emoji}</span>
                          ))}
                          <span className="text-[9px] font-bold text-gray-500 ml-0.5">{msg.reactions.length}</span>
                        </div>
                      )}
                    </div>
                    {/* Quick Reaction and Action Floating Toolbar on Hover */}
                        {(hoveredMessageId === msg._id || isMenuOpen) && !msg.isDeleted && (
                          <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-white dark:bg-slate-800 shadow-md border border-gray-150 dark:border-slate-700 animate-fade-in-up self-center mx-2 shrink-0">
                            {/* Reactions panel */}
                            <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-150 dark:border-slate-700">
                              {['👍', '❤️', '😂', '🔥'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => reactMessage(msg._id, emoji)}
                                  className="hover:scale-125 transition text-xs p-0.5"
                                  title={`React ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                         {/* Actions panel */}
                            <div className="flex items-center gap-0.5 pl-1">
                              <button
                                onClick={() => setReplyMessage(msg)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-750 text-gray-500 hover:text-[#3B82F6] transition-colors"
                                title="Reply"
                              >
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>
                              
                              <button
                                onClick={() => togglePinMessage(msg._id)}
                                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors ${msg.pinned ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                                title={msg.pinned ? 'Unpin' : 'Pin'}
                              >
                                <Pin className="h-3.5 w-3.5 rotate-45" />
                              </button>
                              {isSelf && (
                                <>
                                  <button
                                    onClick={() => startEditing(msg)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-750 text-gray-500 hover:text-green-500 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { if (window.confirm('Delete this message?')) deleteMessage(msg._id); }}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-750 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  
                                </>
                              )}
                            </div>
                           </div>
                        )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing status display */}
            {typingUsers[activeChat._id]?.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium italic mt-2">
                <Loader2 className="h-3 w-3 animate-spin text-chat-light-primary" />
                <span>{typingUsers[activeChat._id].join(', ')} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Bottom Control Bar for Typing Input */}
          <div className="border-t border-gray-250 bg-white/95 px-4 py-3 dark:border-gray-800 dark:bg-[#1f2c33]/95">
            
            {/* Reply indicator banner */}
            {replyMessage && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border-l-4 border-chat-light-primary dark:border-chat-dark-primary px-3 py-1.5 rounded-lg mb-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-chat-light-primary block">{replyMessage.sender?.username}</span>
                  <span className="text-gray-500 truncate block">{replyMessage.content || 'Attachment'}</span>
                </div>
                <button onClick={() => setReplyMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Selected Upload preview banner */}
            {selectedFile && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl mb-2 text-xs">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} className="h-10 w-10 object-cover rounded-md" />
                ) : (
                  <FileText className="h-8 w-8 text-chat-light-primary" />
                )}
                <div className="min-w-0">
                  <p className="font-bold truncate max-w-[180px]">{selectedFile.name}</p>
                  <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => { setSelectedFile(null); setFilePreviewUrl(''); }} className="ml-auto text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Typing input controls form */}
            <form onSubmit={handleSend} className="flex items-center gap-3 relative">
              <button
                type="button"
                onClick={handleTriggerFile}
                className="rounded-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-550 dark:text-gray-300"
                title="Attach document or image"
              >
                <Paperclip className="h-5.5 w-5.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-550 dark:text-gray-300"
              >
                <Smile className="h-5.5 w-5.5" />
              </button>
              {/* Absolute Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-30">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    width={320}
                    height={350}
                  />
                </div>
              )}
              <input
                type="text"
                placeholder="Type a message"
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 rounded-xl bg-gray-100 dark:bg-[#2a3942] py-2.5 px-4 outline-none text-sm text-gray-900 dark:text-white border border-transparent focus:border-chat-light-primary/30"
              />
              <button
                type="submit"
                disabled={!inputText.trim() && !selectedFile}
                className="rounded-xl bg-chat-light-primary dark:bg-chat-dark-primary p-2.5 text-white hover:opacity-90 transition shadow-md disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};
export default ChatWindow;
