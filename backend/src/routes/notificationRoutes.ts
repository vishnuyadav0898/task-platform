import { Router } from 'express';
import { getNotifications, markAllAsRead, clearAllNotifications } from '../controllers/notificationController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
router.use(authenticateJWT);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /notifications/readAll:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully marked as read
 */
router.put('/readAll', markAllAsRead);

/**
 * @swagger
 * /notifications/clearAll:
 *   delete:
 *     summary: Clear all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully cleared
 */
router.delete('/clearAll', clearAllNotifications);

export default router;
