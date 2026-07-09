import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import workAreaRoutes from './work-area.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/work-areas', workAreaRoutes);

export default router;
