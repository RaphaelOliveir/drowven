import { Router } from 'express';
import * as workAreaController from '../controllers/work-area.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: WorkAreas
 *   description: Work areas management
 */

/**
 * @swagger
 * /api/v1/work-areas:
 *   get:
 *     summary: Retrieve a list of work areas
 *     tags: [WorkAreas]
 *     parameters:
 *       - in: query
 *         name: areaName
 *         schema:
 *           type: string
 *         description: Optional name to filter work areas
 *     responses:
 *       200:
 *         description: A list of work areas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
router.get('/', workAreaController.getWorkAreas);

export default router;
