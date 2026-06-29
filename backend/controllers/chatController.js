import Chat from '../models/Chat.js';
import User from '../models/User.js';
// @desc    Access or create a 1-to-1 chat
// @route   POST /api/chats
// @access  Private
export const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }
  try {
    // Check if chat already exists
    let isChat = await Chat.find({
      participants: { $all: [req.user._id, userId] }
    })
      .populate('participants', '-password')
      .populate('latestMessage');
    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username avatar email online lastSeen'
    });
    if (isChat.length > 0) {
      res.status(200).json(isChat[0]);
    } else {
      // Create new chat
      const chatData = {
        participants: [req.user._id, userId],
        unreadCounts: [
          { user: req.user._id, count: 0 },
          { user: userId, count: 0 }
        ]
      };
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'participants',
        '-password'
      );
      res.status(200).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all 1-to-1 chats for logged in user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('participants', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email online lastSeen'
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Toggle pin a chat
// @route   PUT /api/chats/:id/pin
// @access  Private
export const togglePinChat = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const pinnedIndex = user.pinnedChats.indexOf(chatId);
    if (pinnedIndex > -1) {
      user.pinnedChats.splice(pinnedIndex, 1);
    } else {
      user.pinnedChats.push(chatId);
    }
    await user.save();
    res.json({ pinnedChats: user.pinnedChats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
