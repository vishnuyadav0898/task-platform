import { Router } from 'express';
import { getActivityLog } from '../controllers/activityController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
router.use(authenticateJWT);

/**
 * @swagger
 * /activities/workspace/{workspaceSlug}/project/{projectSlug}:
 *   get:
 *     summary: Get activity log for a project
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceSlug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/workspace/:workspaceSlug/project/:projectSlug', getActivityLog);

export default router;
