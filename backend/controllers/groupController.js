import Group from '../models/Group.js';
import User from '../models/User.js';
// @desc    Create a new Group Chat
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  const { name, description, members } = req.body;
  if (!name || !members) {
    return res.status(400).json({ message: 'Please enter group name and members list' });
  }
  let parsedMembers = typeof members === 'string' ? JSON.parse(members) : members;
  if (parsedMembers.length < 1) {
    return res.status(400).json({ message: 'At least 1 member must be added to a group' });
  }
  // Include creator
  if (!parsedMembers.includes(req.user._id.toString())) {
    parsedMembers.push(req.user._id.toString());
  }
  try {
    const unreadCounts = parsedMembers.map(userId => ({ user: userId, count: 0 }));
    const groupData = {
      name,
      description: description || '',
      creator: req.user._id,
      members: parsedMembers,
      admins: [req.user._id],
      unreadCounts
    };
    if (req.file) {
      groupData.avatar = req.file.path; // Cloudinary URL
    }
    const createdGroup = await Group.create(groupData);
    const fullGroup = await Group.findOne({ _id: createdGroup._id })
      .populate('members', '-password')
      .populate('creator', '-password')
      .populate('admins', '-password');
    res.status(201).json(fullGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all groups for logged in user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    let groups = await Group.find({
      members: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('members', '-password')
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
    groups = await User.populate(groups, {
      path: 'latestMessage.sender',
      select: 'username avatar email online lastSeen'
    });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update Group Info (name, description, avatar)
// @route   PUT /api/groups/:id
// @access  Private
export const updateGroup = async (req, res) => {
  const { name, description } = req.body;
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Check if user is admin
    if (!group.admins.some(adminId => adminId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Only admins can update group info' });
    }
    group.name = name || group.name;
    group.description = description !== undefined ? description : group.description;
    if (req.file) {
      group.avatar = req.file.path;
    }
    const updatedGroup = await group.save();
    const fullGroup = await Group.findOne({ _id: updatedGroup._id })
      .populate('members', '-password')
      .populate('creator', '-password')
      .populate('admins', '-password');
    res.json(fullGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Add member to group
// @route   PUT /api/groups/:id/add
// @access  Private
export const addGroupMember = async (req, res) => {
  const { userId } = req.body;
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Check if admin
    if (!group.admins.some(adminId => adminId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }
    if (group.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }
    group.members.push(userId);
    group.unreadCounts.push({ user: userId, count: 0 });
    const updatedGroup = await group.save();
    
    const fullGroup = await Group.findOne({ _id: updatedGroup._id })
      .populate('members', '-password')
      .populate('admins', '-password');
    res.json(fullGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Remove member from group
// @route   PUT /api/groups/:id/remove
// @access  Private
export const removeGroupMember = async (req, res) => {
  const { userId } = req.body;
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const isSelfRemove = req.user._id.toString() === userId;
    const isAdmin = group.admins.some(adminId => adminId.toString() === req.user._id.toString());
    // Can only remove if self-leaving, or if admin removing someone else
    if (!isSelfRemove && !isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }
    // Creator cannot leave the group directly unless deleting it
    if (group.creator.toString() === userId) {
      return res.status(400).json({ message: 'Creator cannot leave the group. Delete the group instead.' });
    }
    group.members = group.members.filter(m => m.toString() !== userId);
    group.admins = group.admins.filter(a => a.toString() !== userId);
    group.unreadCounts = group.unreadCounts.filter(uc => uc.user.toString() !== userId);
    // If no admins left but members exist, promote first member to admin
    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins.push(group.members[0]);
    }
    const updatedGroup = await group.save();
    const fullGroup = await Group.findOne({ _id: updatedGroup._id })
      .populate('members', '-password')
      .populate('admins', '-password');
    res.json(fullGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Toggle pin group
// @route   PUT /api/groups/:id/pin
// @access  Private
export const togglePinGroup = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const groupId = req.params.id;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const pinnedIndex = user.pinnedGroups.indexOf(groupId);
    if (pinnedIndex > -1) {
      user.pinnedGroups.splice(pinnedIndex, 1);
    } else {
      user.pinnedGroups.push(groupId);
    }
    await user.save();
    res.json({ pinnedGroups: user.pinnedGroups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
