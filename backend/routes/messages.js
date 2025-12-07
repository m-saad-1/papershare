const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth.js');
const Conversation = require('../models/Conversation.js');
const Message = require('../models/Message.js');
const { getRecipientSocketId, getIo } = require('../socket/socket.js');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf files are allowed!'), false);
    }
  },
});

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get all conversations for the logged-in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'username')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get all messages for a conversation
 * @access  Private
 */
router.get('/:conversationId', protect, async (req, res) => {
  try {
    // Ensure the user is a participant of the conversation
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or user not a participant' });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/messages/send
 * @desc    Send a text message
 * @access  Private
 */
router.post('/send', protect, async (req, res) => {
  try {
    const io = getIo();
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and content are required' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId]
      });
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      content
    });

    await message.save();
    await message.populate('sender', 'username');

    // Update conversation last message
    conversation.lastMessage = message._id;
    await conversation.save();

    // Emit via socket
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', message);
    }

    const senderSocketId = getRecipientSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('newMessage', message);
    }

    res.status(201).json({ 
      success: true, 
      message,
      conversation 
    });
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/messages/upload
 * @desc    Upload a file attachment for a message
 * @access  Private
 */
router.post(
  '/upload',
  protect,
  upload.single('file'),
  async (req, res) => {
    try {
      const io = getIo();
      const { recipientId, content } = req.body;
      const senderId = req.user.id;

      if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
      }

      // The public URL path to the file
      const attachmentUrl = `/uploads/${req.file.filename}`;

      // Find or create a conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
        });
      }

      // Create the new message
      const newMessage = new Message({
        conversationId: conversation._id,
        sender: senderId,
        content: content || '',
        attachmentUrl: attachmentUrl,
      });

      await newMessage.save();
      await newMessage.populate('sender', 'username');

      // Update the conversation's last message
      conversation.lastMessage = newMessage._id;
      await conversation.save();

      // Emit the new message to both users
      const recipientSocketId = getRecipientSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', newMessage);
      }
      
      const senderSocketId = getRecipientSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('newMessage', newMessage);
      }

      res.status(201).json({ 
        success: true,
        message: 'File uploaded successfully.', 
        newMessage, 
        conversation 
      });
    } catch (error) {
      console.error('Error in file upload route:', error);
      res.status(500).json({ message: 'Server error during file upload.' });
    }
  }
);

module.exports = router;