import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workAreaRoutes from './work-area.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/work-areas', workAreaRoutes);
router.use('/conversations', conversationRoutes);

export default router;
