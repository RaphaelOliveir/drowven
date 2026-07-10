import { query, queryOne } from '../database/pool';
import { Conversation, Message } from '../models/conversation.model';
import { AppError } from '../middlewares/errorHandler';

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const queryStr = `
    SELECT 
      c.*,
      u1.name AS sender_name,
      u2.name AS receiver_name
    FROM conversations c
    JOIN users u1 ON c.sender_user_id = u1.id
    JOIN users u2 ON c.receiver_user_id = u2.id
    WHERE c.sender_user_id = $1 OR c.receiver_user_id = $1
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  `;
  return query<Conversation>(queryStr, [userId]);
}

export async function createOrGetConversation(userId1: string, userId2: string): Promise<Conversation> {
  if (userId1 === userId2) {
    throw new AppError('Cannot start a conversation with yourself', 400);
  }

  const existing = await queryOne<Conversation>(
    `SELECT * FROM conversations 
     WHERE (sender_user_id = $1 AND receiver_user_id = $2) 
        OR (sender_user_id = $2 AND receiver_user_id = $1)`,
    [userId1, userId2]
  );

  if (existing) {
    return existing;
  }

  const [newConversation] = await query<Conversation>(
    `INSERT INTO conversations (sender_user_id, receiver_user_id) 
     VALUES ($1, $2) 
     RETURNING *`,
    [userId1, userId2]
  );

  return newConversation;
}

export async function getConversationById(id: string): Promise<Conversation> {
  const conversation = await queryOne<Conversation>(
    'SELECT * FROM conversations WHERE id = $1',
    [id]
  );

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  return conversation;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return query<Message>(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
}

export async function saveMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const [message] = await query<Message>(
    `INSERT INTO messages (conversation_id, sender_id, content) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [conversationId, senderId, content]
  );

  await query(
    `UPDATE conversations 
     SET last_message_at = $1, last_message_id = $2, updated_at = NOW() 
     WHERE id = $3`,
    [message.created_at, message.id, conversationId]
  );

  return message;
}
