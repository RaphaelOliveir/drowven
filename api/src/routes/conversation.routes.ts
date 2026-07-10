import { Router } from 'express';
import * as conversationController from '../controllers/conversation.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation and messaging operations
 */

/**
 * @swagger
 * /api/v1/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
router.get('/', conversationController.listConversations);

/**
 * @swagger
 * /api/v1/conversations:
 *   post:
 *     summary: Start or fetch a conversation with a specific user
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created or retrieved
 *       400:
 *         description: targetUserId is required
 *       401:
 *         description: Unauthorized
 */
router.post('/', conversationController.createConversation);

/**
 * @swagger
 * /api/v1/conversations/{id}/messages:
 *   get:
 *     summary: Get message history for a conversation
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The conversation ID
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not part of the conversation)
 *       404:
 *         description: Conversation not found
 */
router.get('/:id/messages', conversationController.getConversationMessages);

/**
 * @swagger
 * /api/v1/conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation (REST)
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: content is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not part of the conversation)
 *       404:
 *         description: Conversation not found
 */
router.post('/:id/messages', conversationController.sendMessage);

export default router;
