import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as conversationService from './services/conversation.service';
import { env } from './config/env';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_me_in_production';

interface JwtPayload {
  userId: string;
}

export function initSocketServer(server: HttpServer): void {
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      socket.data.user = { id: decoded.userId };
      next();
    } catch (_err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.data.user.id}`);

    void socket.join(socket.data.user.id);

    socket.on('sendMessage', async (payload: { conversationId: string; receiverId: string; content: string }) => {
      try {
        const { conversationId, receiverId, content } = payload;
        
        const message = await conversationService.saveMessage(
          conversationId,
          socket.data.user.id,
          content
        );

        io.to(receiverId).emit('receiveMessage', message);

        socket.emit('messageSent', message);

      } catch (err) {
        console.error('[Socket] Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.data.user.id}`);
    });
  });
}
