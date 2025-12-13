const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  findOrCreateConversation,
  uploadAttachment, // Import new function
  upload            // Import multer middleware
} = require('../controllers/messageController'); // Updated import

router.route('/conversations').get(protect, getConversations).post(protect, findOrCreateConversation);
router.route('/:conversationId/messages').get(protect, getMessages);
router.route('/:conversationId/messages').post(protect, sendMessage);
router.route('/:conversationId/attachments').post(protect, upload.single('file'), uploadAttachment); // New route for attachments

module.exports = router;
