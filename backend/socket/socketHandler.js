import User from '../models/User.js';
// Keep track of active connections: Map of userId -> socket.id
const activeUsers = new Map();
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected to socket.io:', socket.id);
    // 1. Setup user room and set online status
    socket.on('setup', async (userData) => {
      if (!userData || !userData._id) return;
      
      socket.join(userData._id);
      activeUsers.set(userData._id, socket.id);
      
      console.log(`User ${userData.username} (${userData._id}) is online.`);
      
      // Update DB to online
      try {
        await User.findByIdAndUpdate(userData._id, { online: true });
      } catch (err) {
        console.error('Socket setup status update failed:', err.message);
      }
      // Broadcast to everyone that user is online
      socket.broadcast.emit('user_online', userData._id);
      
      // Send the active users list to the setting up user
      socket.emit('online_users_list', Array.from(activeUsers.keys()));
    });
    // 2. Join a chat/group room
    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    // 3. Leave a chat/group room
    socket.on('leave_chat', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });
    // 4. Typing indicators
    socket.on('typing', ({ room, user }) => {
      socket.in(room).emit('typing', { room, user });
    });
    socket.on('stop_typing', ({ room, user }) => {
      socket.in(room).emit('stop_typing', { room, user });
    });
    // 5. Direct/Group messaging & Notifications
    socket.on('new_message', (newMessageReceived) => {
      const { chat: chatObj, chatType, sender } = newMessageReceived;
      const chatId = typeof chatObj === 'object' ? chatObj._id : chatObj;
      if (!chatId) return;
      // Broadcast the message inside the chat room so active chat participants receive it
      socket.in(chatId).emit('message_received', newMessageReceived);
      // Distribute notifications to recipients who are NOT in the active room
      if (chatType === 'Chat') {
        // chatObj should contain participants populated
        if (chatObj.participants) {
          chatObj.participants.forEach((user) => {
            const userId = typeof user === 'object' ? user._id : user;
            if (userId.toString() === sender._id.toString()) return;
            // Emit a global alert to the recipient's personal room
            socket.in(userId.toString()).emit('notification_received', newMessageReceived);
          });
        }
      } else if (chatType === 'Group') {
        // For groups, chatObj should contain members populated or we emit to all members
        if (chatObj.members) {
          chatObj.members.forEach((member) => {
            const memberId = typeof member === 'object' ? member._id : member;
            if (memberId.toString() === sender._id.toString()) return;
            // Emit to member's personal room
            socket.in(memberId.toString()).emit('notification_received', newMessageReceived);
          });
        }
      }
    });
    // 6. Read Receipts
    socket.on('message_seen', ({ chatId, userId, chatType }) => {
      socket.in(chatId).emit('message_seen', { chatId, userId, chatType });
    });
    // 7. Message Reactions
    socket.on('message_reacted', (updatedMessage) => {
      const chatId = typeof updatedMessage.chat === 'object' ? updatedMessage.chat._id : updatedMessage.chat;
      if (chatId) {
        socket.in(chatId).emit('message_reacted', updatedMessage);
      }
    });
    // 8. Message Edits
    socket.on('message_edited', (updatedMessage) => {
      const chatId = typeof updatedMessage.chat === 'object' ? updatedMessage.chat._id : updatedMessage.chat;
      if (chatId) {
        socket.in(chatId).emit('message_edited', updatedMessage);
      }
    });
    // 9. Message Deletions
    socket.on('message_deleted', (deletedMessage) => {
      const chatId = typeof deletedMessage.chat === 'object' ? deletedMessage.chat._id : deletedMessage.chat;
      if (chatId) {
        socket.in(chatId).emit('message_deleted', deletedMessage);
      }
    });
    // 10. Disconnection
    socket.on('disconnect', async () => {
      console.log('Socket disconnected:', socket.id);
      let disconnectedUserId = null;
      // Find the user ID matching this socket ID
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      if (disconnectedUserId) {
        activeUsers.delete(disconnectedUserId);
        console.log(`User ${disconnectedUserId} went offline.`);
        try {
          await User.findByIdAndUpdate(disconnectedUserId, {
            online: false,
            lastSeen: new Date()
          });
        } catch (err) {
          console.error('Socket disconnect status update failed:', err.message);
        }
        // Broadcast user status change and update lists
        socket.broadcast.emit('user_offline', disconnectedUserId);
        socket.broadcast.emit('online_users_list', Array.from(activeUsers.keys()));
      }
    });
  });
};
export default socketHandler;
export { activeUsers };
