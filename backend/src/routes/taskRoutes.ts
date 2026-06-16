import { Router } from 'express';
import { createTask, getProjectTasks, getTaskTree, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateJWT } from '../middlewares/auth';
import commentRoutes from './commentRoutes';

const router = Router();

router.use(authenticateJWT);

router.use('/:taskId/comments', commentRoutes);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task (or subtask)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: integer
 *               parentId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE]
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', createTask);

/**
 * @swagger
 * /tasks/workspace/{workspaceSlug}/project/{projectSlug}:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
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
 *         description: List of tasks
 */
router.get('/workspace/:workspaceSlug/project/:projectSlug', getProjectTasks);

/**
 * @swagger
 * /tasks/{taskId}/tree:
 *   get:
 *     summary: Get full recursive task tree
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task tree array
 */
router.get('/:taskId/tree', getTaskTree);

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put('/:taskId', updateTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 */
router.delete('/:taskId', deleteTask);

export default router;
