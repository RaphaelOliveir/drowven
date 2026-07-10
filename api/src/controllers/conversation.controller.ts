import { Request, Response, NextFunction } from 'express';
import * as conversationService from '../services/conversation.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';
import { User } from '../models/user.model';

interface AuthRequest extends Request {
  user?: User;
}

export async function listConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const conversations = await conversationService.getUserConversations(req.user.id);
    sendSuccess(res, conversations);
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      throw new AppError('targetUserId is required', 400);
    }

    const conversation = await conversationService.createOrGetConversation(req.user.id, targetUserId);
    sendCreated(res, conversation);
  } catch (err) {
    next(err);
  }
}

export async function getConversationMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = req.params.id as string;
    
    const conversation = await conversationService.getConversationById(id);
    if (conversation.sender_user_id !== req.user.id && conversation.receiver_user_id !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    const messages = await conversationService.getMessages(id);
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content) {
      throw new AppError('content is required', 400);
    }

    const conversation = await conversationService.getConversationById(id);
    if (conversation.sender_user_id !== req.user.id && conversation.receiver_user_id !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    const message = await conversationService.saveMessage(id, req.user.id, content);
    sendCreated(res, message);
  } catch (err) {
    next(err);
  }
}
