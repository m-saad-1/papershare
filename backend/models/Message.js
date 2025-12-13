const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This must match the name of your User model
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);