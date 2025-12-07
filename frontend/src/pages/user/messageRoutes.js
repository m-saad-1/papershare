import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { getRecipientSocketId, io } from '../socket/socket.js';

// This is a placeholder for a real cloud upload service
// In a production app, you would upload to a service like AWS S3 or Cloudinary
// TODO: Replace this with a real cloud upload implementation
const uploadToCloud = async (file) => {
  // For demonstration, we'll just return a fake path.
  console.log(`"Uploading" file: ${file.originalname}`);
  const attachmentUrl = `/uploads/attachments/${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
  console.log(`File available at placeholder URL: ${attachmentUrl}`);
  return attachmentUrl;
};

const router = express.Router();

// Configure multer for file handling
// We'll use memoryStorage to handle the file as a buffer before uploading to a cloud service.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // We're only accepting PDFs as requested
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      // To send a client-friendly error, we can pass an error to cb.
      // This can be handled in an error-handling middleware.
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'), false);
    }
  },
});

/**
 * @route   POST /api/messages/upload
 * @desc    Upload a file attachment for a message
 * @note    This file should be moved to the backend routes directory.
 * @access  Private
 */
router.post(
  '/upload',
  protectRoute,
  upload.single('file'),
  async (req, res) => {
    try {
      const { recipientId, content } = req.body;
      const senderId = req.user._id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
      }

      // Upload file to your cloud storage and get the URL
      const attachmentUrl = await uploadToCloud(req.file);

      // Find or create a conversation between the sender and recipient
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
        });
      }

      // Create a new message with the attachment URL
      const newMessage = new Message({
        conversationId: conversation._id,
        sender: senderId,
        content: content || '', // The text part of the message is optional
        attachmentUrl: attachmentUrl,
      });

      // Save the message and update the conversation's last message
      await newMessage.save();
      conversation.lastMessage = newMessage._id;
      await conversation.save();

      // Populate sender details for the socket event
      await newMessage.populate('sender', 'username profilePic');

      // Emit the new message to both the sender and the recipient via sockets
      const recipientSocketId = getRecipientSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', newMessage);
      }
    } catch (error) {
      console.error('Error in file upload route:', error);
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + error.message });
      }
      res.status(500).json({ message: 'Server error during file upload.' });
    }
  }
);

// You should merge this with your existing message routes.
// For example, if you have a GET route for messages, it would go here.
// router.get('/:conversationId', protectRoute, getMessages);

export default router;