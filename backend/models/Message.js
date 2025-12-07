const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    // Content is not required if an attachment is present
    required: function() { return !this.attachmentUrl; }
  },
  attachmentUrl: {
    type: String
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);