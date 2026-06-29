import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  const { content, chatId, chatType, replyTo } = req.body;
  if (!chatId || !chatType) {
    return res.status(400).json({ message: 'Missing Chat ID or Chat Type' });
  }
  try {
    let messageData = {
      sender: req.user._id,
      chat: chatId,
      chatType: chatType,
      content: content || '',
      readBy: [{ user: req.user._id }]
    };
    if (replyTo) {
      messageData.replyTo = replyTo;
    }
    // Attachment processing from multer upload
    if (req.file) {
      messageData.mediaUrl = req.file.path; // Cloudinary file URL
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      
      const mime = req.file.mimetype;
      if (mime.startsWith('image/')) {
        messageData.mediaType = 'image';
      } else if (mime === 'application/pdf') {
        messageData.mediaType = 'pdf';
      } else {
        messageData.mediaType = 'document';
      }
    }
    let message = await Message.create(messageData);
    message = await message.populate('sender', 'username avatar');
    if (replyTo) {
      message = await message.populate('replyTo');
      message = await User.populate(message, {
        path: 'replyTo.sender',
        select: 'username'
      });
    }
    // Update latest message & unread count in parent chats
    if (chatType === 'Chat') {
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.latestMessage = message._id;
        chat.unreadCounts.forEach(uc => {
          if (uc.user.toString() !== req.user._id.toString()) {
            uc.count += 1;
          }
        });
        await chat.save();
      }
    } else if (chatType === 'Group') {
      const group = await Group.findById(chatId);
      if (group) {
        group.latestMessage = message._id;
        group.unreadCounts.forEach(uc => {
          if (uc.user.toString() !== req.user._id.toString()) {
            uc.count += 1;
          }
        });
        await group.save();
      }
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all messages for a specific Chat/Group
// @route   GET /api/messages/:chatType/:chatId
// @access  Private
export const getMessages = async (req, res) => {
  const { chatType, chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId, chatType })
      .populate('sender', 'username avatar online lastSeen')
      .populate('replyTo')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username'
        }
      });
    // Mark messages as read by adding current user to readBy
    await Message.updateMany(
      { chat: chatId, chatType, 'readBy.user': { $ne: req.user._id } },
      { $push: { readBy: { user: req.user._id } } }
    );
    // Reset unread counts
    if (chatType === 'Chat') {
      await Chat.updateOne(
        { _id: chatId, 'unreadCounts.user': req.user._id },
        { $set: { 'unreadCounts.$.count': 0 } }
      );
    } else if (chatType === 'Group') {
      await Group.updateOne(
        { _id: chatId, 'unreadCounts.user': req.user._id },
        { $set: { 'unreadCounts.$.count': 0 } }
      );
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
export const editMessage = async (req, res) => {
  const { content } = req.body;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }
    message.content = content || '';
    message.isEdited = true;
    await message.save();
    const fullMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('replyTo');
    res.json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Soft delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.mediaUrl = '';
    message.fileName = '';
    message.fileSize = 0;
    message.mediaType = '';
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    React to a message
// @route   POST /api/messages/:id/react
// @access  Private
export const reactMessage = async (req, res) => {
  const { emoji } = req.body;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    const existingReactionIndex = message.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );
    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }
    await message.save();
    const fullMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('replyTo');
    res.json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Toggle pin a message
// @route   PUT /api/messages/:id/pin
// @access  Private
export const togglePinMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.pinned = !message.pinned;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
