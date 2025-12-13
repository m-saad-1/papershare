const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/user'); // Assuming your User model is here

// @route   POST /api/conversations
// @desc    Find or create a new conversation
// @access  Private
router.post('/', auth, async (req, res) => {
  const { recipientId } = req.body;
  const loggedInUserId = req.user.id;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required.' });
  }

  try {
    // Find if a DM conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [loggedInUserId, recipientId], $size: 2 },
    }).populate('participants', 'username email');

    // If no conversation exists, create one
    if (!conversation) {
      const newConversation = new Conversation({
        participants: [loggedInUserId, recipientId],
      });
      await newConversation.save();
      // Populate the participants' details for the new conversation
      conversation = await Conversation.findById(newConversation._id)
        .populate('participants', 'username email');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/conversations/:conversationId/messages
// @desc    Get all messages for a conversation
// @access  Private
router.get('/:conversationId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'username')
      .sort({ createdAt: 'asc' });

    res.json({ messages });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/conversations/:conversationId/messages
// @desc    Send a new message
// @access  Private
router.post('/:conversationId/messages', auth, async (req, res) => {
  const { text } = req.body;
  const { conversationId } = req.params;
  const senderId = req.user.id;

  if (!text) {
    return res.status(400).json({ message: 'Message text is required.' });
  }

  try {
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text,
    });

    await newMessage.save();

    // Also update the lastMessage field in the conversation
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id });

    // In a real-time app, you would emit this message via WebSockets here.

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;