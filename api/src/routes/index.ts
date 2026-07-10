import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workAreaRoutes from './work-area.routes';
import conversationRoutes from './conversation.routes';
import { authRateLimiter } from '../config/rate-limit.config';

const router = Router();

router.use('/auth', authRateLimiter, authRoutes);
router.use('/users', userRoutes);
router.use('/work-areas', workAreaRoutes);
router.use('/conversations', conversationRoutes);

export default router;
