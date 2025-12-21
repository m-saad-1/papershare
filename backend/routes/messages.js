import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  findOrCreateConversation,
  upload, // Import multer middleware
} from '../controllers/messageController.js';

router.route('/conversations').get(protect, getConversations).post(protect, findOrCreateConversation);
router.route('/:conversationId/messages').get(protect, getMessages);
router.route('/:conversationId/messages').post(protect, upload.single('file'), sendMessage);


export default router;
