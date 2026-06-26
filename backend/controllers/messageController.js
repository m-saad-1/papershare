import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/user.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' directory exists
    // In a real app, you might want to create it if it doesn't exist.
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // A more robust way to generate a unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const extension = path.extname(file.originalname);
    cb(null, `attachment-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Define allowed file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp3', '.wav', '.ogg', '.mp4', '.mov', '.avi'];

    // Check mime type and file extension
    const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());

    if (isMimeTypeAllowed && isExtensionAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type! Please upload a supported file.'), false);
    }
  },
});




// @desc    Get all conversations for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // Fetch conversations where the current user is a participant
  const conversations = await Conversation.find({ participants: req.user._id })
    // Populate participant details and the last message for each conversation
    .populate('participants', 'username profilePicture isOnline reputation badgeKeys contributorStatus')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username',
      },
    })
    .sort({ updatedAt: -1 }); // Sort by most recently updated

  // Enhance conversations with unread counts and dynamic recipient data
  const enhancedConversations = await Promise.all(
    conversations.map(async (convo) => {
      // Logic to determine unread messages would go here if not already handled
      // For example, based on a 'readBy' field in the Message model
      
      const recipient = convo.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      
      return {
        ...convo.toObject(),
        recipient, // Add recipient for easier frontend handling
      };
    })
  );

  res.json(enhancedConversations);
});

// @desc    Get all messages for a specific conversation
// @route   GET /api/messages/:conversationId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  // Find all messages belonging to the given conversation ID
  const messages = await Message.find({ conversationId: req.params.conversationId })
    // Populate sender information for each message
    .populate('sender', 'username profilePicture reputation badgeKeys contributorStatus')
    // Sort messages chronologically
    .sort({ createdAt: 'asc' });

  res.json(messages);
});

// @desc    Send a new message
// @route   POST /api/messages/:conversationId/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  if (!conversationId) {
    res.status(400);
    throw new Error('Conversation ID is required.');
  }

  // Ensure there is either text or a file
  if (!text && !req.file) {
    res.status(400);
    throw new Error('Message must contain either text or a file.');
  }

  let fileUrl = null;
  let fileName = null;

  if (req.file) {
    // In the Message model, we store the path relative to the uploads folder
    // The base URL is prepended on the frontend.
    fileUrl = `uploads/${req.file.filename}`;
    fileName = req.file.originalname;
  }

  // Create and save the new message
  let message = await Message.create({
    conversationId,
    sender: senderId,
    text: text || '', // Ensure text is at least an empty string
    fileUrl,
    fileName,
  });

  // Populate sender details for the response
  message = await message.populate('sender', 'username profilePicture reputation badgeKeys contributorStatus');


  // Update the conversation's last message
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.lastMessage = message._id;
    await conversation.save();
    
    // You might also want to emit this message via socket.io to the recipient
    // For example: req.io.to(recipientSocketId).emit('newMessage', message);
  }

  res.status(201).json(message);
});

// @desc    Find or create a one-on-one conversation
// @route   POST /api/messages/conversations
// @access  Private
const findOrCreateConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  // Validate that recipientId is provided
  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required to start a conversation.');
  }

  // Find an existing conversation between the two users
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId], $size: 2 }, // Ensure it's a 1-on-1 chat
  });

  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
    });
  }

  // Populate participant details for the response
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate('participants', 'username profilePicture isOnline reputation badgeKeys contributorStatus');

  res.status(200).json(populatedConversation);
});

export {
  getConversations,
  getMessages,
  sendMessage,
  findOrCreateConversation,
  upload, // Export multer upload middleware
};
