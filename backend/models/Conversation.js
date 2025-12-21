import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User' // This must match the name of your User model
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  // You can extend this for group chats in the future
}, {
  timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);