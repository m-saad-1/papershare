const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/user');
const multer = require('multer'); // Import multer
const path = require('path');     // Import path

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // files will be saved in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|ogg|mp4|mov|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  },
});

// @desc    Upload an attachment and send it as a message
// @route   POST /api/messages/:conversationId/attachments
// @access  Private
const uploadAttachment = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const senderId = req.user._id;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded.');
  }

  const attachmentUrl = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype.split('/')[0]; // 'image', 'video', 'audio', 'application'

  const message = await Message.create({
    conversationId: conversationId,
    sender: senderId,
    text: `Sent a ${req.file.originalname}`, // Populate 'text' field to match schema
    attachment: {
      url: attachmentUrl,
      type: fileType,
    },
  });

  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.lastMessage = message._id;
    await conversation.save();
  }

  res.status(201).json({ message, attachmentUrl });
});


// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  console.log(`[getConversations] User ID: ${req.user._id}`);
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'username avatar')
    .populate('lastMessage');
  console.log(`[getConversations] Found ${conversations.length} conversations for user ${req.user._id}`);
  res.json(conversations);
});

// @desc    Get all messages for a conversation
// @route   GET /api/messages/:conversationId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.conversationId })
    .populate('sender', 'username avatar')
    .sort({ createdAt: 'asc' });
  console.log(`[getMessages] Fetching messages for conversationId: ${req.params.conversationId}`);
  console.log(`[getMessages] Messages found: ${messages.length}`);
  res.json(messages);
});

// @desc    Send a new message
// @route   POST /api/messages/:conversationId/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params; // Get conversationId from params
  const { text, attachment } = req.body; // Allow attachment in body
  const senderId = req.user._id;

  if (!conversationId) {
    res.status(400);
    throw new Error('Conversation ID is required.');
  }

  let messageText = text;
  if (!messageText && attachment) {
    // If only attachment is present, provide a default text
    messageText = `Sent a ${attachment.type || 'file'}`;
  } else if (!messageText && !attachment) {
    res.status(400);
    throw new Error('Text or attachment is required.');
  }

  const message = await Message.create({
    conversationId: conversationId,
    sender: senderId,
    text: messageText, // Use 'text' to match schema
    attachment: attachment, // Save attachment if present
  });

  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.lastMessage = message._id;
    await conversation.save();
  }

  res.status(201).json(message);
});

// @desc    Find or create a conversation
// @route   POST /api/messages/conversations
// @access  Private
const findOrCreateConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  console.log(`[findOrCreateConversation] Attempting to find or create conversation with recipientId: ${recipientId}`);

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] },
  }).populate('participants', 'username avatar');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
    });
    // Populate after creation as well
    conversation = await conversation.populate('participants', 'username avatar');
    console.log(`[findOrCreateConversation] New conversation created: ${conversation._id}`);
  } else {
    console.log(`[findOrCreateConversation] Existing conversation found: ${conversation._id}`);
  }

  res.status(200).json(conversation);
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  findOrCreateConversation,
  uploadAttachment, // Export the new function
  upload            // Export multer upload middleware to be used in routes
};
