const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  findOrCreateConversation,
  upload, // Import multer middleware
} = require('../controllers/messageController');

router.route('/conversations').get(protect, getConversations).post(protect, findOrCreateConversation);
router.route('/:conversationId/messages').get(protect, getMessages);
router.route('/:conversationId/messages').post(protect, upload.single('file'), sendMessage);


module.exports = router;
