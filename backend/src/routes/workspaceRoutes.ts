import { Router } from 'express';
import { createWorkspace, getWorkspaces, getProjects, createProject, deleteWorkspace, deleteProject, inviteMember, acceptInvite } from '../controllers/workspaceController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 */
router.post('/', createWorkspace);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get user workspaces
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get('/', getWorkspaces);

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Workspace deleted
 */
router.delete('/:id', deleteWorkspace);

/**
 * @swagger
 * /workspaces/{workspaceSlug}/projects:
 *   get:
 *     summary: Get projects in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/:workspaceSlug/projects', authorizeRoles('ADMIN', 'MEMBER'), getProjects);

/**
 * @swagger
 * /workspaces/{workspaceSlug}/projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceSlug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/:workspaceSlug/projects', authorizeRoles('ADMIN', 'MEMBER'), createProject);

/**
 * @swagger
 * /workspaces/{workspaceSlug}/projects/{projectSlug}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *       204:
 *         description: Project deleted
 */
router.delete('/:workspaceSlug/projects/:projectSlug', authorizeRoles('ADMIN', 'MEMBER'), deleteProject);

/**
 * @swagger
 * /workspaces/{workspaceSlug}/members:
 *   post:
 *     summary: Invite a user to the workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceSlug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *     responses:
 *       201:
 *         description: Member added successfully
 */
router.post('/:workspaceSlug/members', authorizeRoles('ADMIN'), inviteMember);

/**
 * @swagger
 * /workspaces/{workspaceSlug}/members/accept:
 *   post:
 *     summary: Accept an invitation to a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite accepted
 *       404:
 *         description: Invite not found
 */
router.post('/:workspaceSlug/members/accept', acceptInvite);

export default router;
