import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['new_message', 'group_invite', 'mention']
  },
  chatType: {
    type: String,
    enum: ['Chat', 'Group'],
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'chatType',
    required: true
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
