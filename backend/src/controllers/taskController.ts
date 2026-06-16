import { Request, Response } from 'express';
import { Task, Project, WorkspaceMember, Activity, Notification, Workspace } from '../models';
import { sequelize } from '../models';
import { QueryTypes } from 'sequelize';
import { AuthRequest } from '../middlewares/auth';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug, projectSlug, parentId, title, description, priority, dueDate, status, assignedToUserId } = req.body;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const project = await Project.findOne({ where: { workspaceId: workspace.id, slug: projectSlug } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const projectId = project.id;
    
    const task = await Task.create({
      projectId,
      parentId: parentId || null,
      title,
      description,
      dueDate,
      priority,
      status,
      assignedToUserId,
      createdById: req.user!.id,
    });
    
    // Log Activity
    const actionType = parentId ? 'CREATED_SUBTASK' : 'CREATED_TASK';
    await Activity.create({
      userId: req.user!.id,
      projectId: task.projectId,
      action: actionType,
      entityType: 'TASK',
      entityId: task.id,
      metadata: { title: task.title }
    });
    
    // Broadcast Notification to Workspace Members
    if (project) {
      const members = await WorkspaceMember.findAll({ where: { workspaceId: project.workspaceId } });
      const notifications = members
        .map(m => ({
          userId: m.userId,
          type: 'INFO',
          message: `New ${parentId ? 'subtask' : 'task'} "${task.title}" was created.`,
        }));
      if (task.assignedToUserId && task.assignedToUserId !== req.user!.id) {
      notifications.push({
        userId: task.assignedToUserId,
        message: `You have been assigned to a new task: "${task.title}"`,
        isRead: false,
        type: 'INFO'
      });
    }

    if (notifications.length > 0) await Notification.bulkCreate(notifications as any);
    }
    
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceSlug, projectSlug } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const workspace = await Workspace.findOne({ where: { slug: workspaceSlug } });
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    const project = await Project.findOne({ where: { workspaceId: workspace.id, slug: projectSlug } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const tasks = await Task.findAndCountAll({
      where: {
        projectId: project.id,
      },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      data: tasks.rows,
      total: tasks.count,
      page: Number(page),
      totalPages: Math.ceil(tasks.count / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskTree = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const query = `
      WITH RECURSIVE task_tree AS (
        SELECT id, "projectId", "parentId", title, description, "dueDate", priority, status, "assignedToUserId", "createdById", "createdAt", "updatedAt", 1 as depth
        FROM tasks
        WHERE id = :taskId
        
        UNION ALL
        
        SELECT t.id, t."projectId", t."parentId", t.title, t.description, t."dueDate", t.priority, t.status, t."assignedToUserId", t."createdById", t."createdAt", t."updatedAt", tt.depth + 1
        FROM tasks t
        INNER JOIN task_tree tt ON t."parentId" = tt.id
      )
      SELECT * FROM task_tree ORDER BY depth ASC, "createdAt" ASC;
    `;
    
    const tasks = await sequelize.query(query, {
      replacements: { taskId },
      type: QueryTypes.SELECT
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    const task = await Task.findByPk(Number(taskId));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const oldStatus = task.status;
    const oldAssignee = task.assignedToUserId;
    await task.update(updates);
    
    if (updates.status && updates.status !== oldStatus) {
      await Activity.create({
        userId: req.user!.id,
        projectId: task.projectId,
        action: 'MOVED_TASK',
        entityType: 'TASK',
        entityId: task.id,
        metadata: { title: task.title, from: oldStatus, to: updates.status }
      });
      
      // Broadcast Notification to Workspace Members
      const project = await Project.findByPk(task.projectId);
      if (project) {
        const members = await WorkspaceMember.findAll({ where: { workspaceId: project.workspaceId } });
        const notifications = members
          .map(m => ({
            userId: m.userId,
            message: `Task "${task.title}" was moved to ${updates.status}`,
          }));
        if (notifications.length > 0) await Notification.bulkCreate(notifications);
      }
    } else {
      await Activity.create({
        userId: req.user!.id,
        projectId: task.projectId,
        action: 'UPDATED_TASK',
        entityType: 'TASK',
        entityId: task.id,
        metadata: { title: task.title }
      });
    }
    
    // Notification for assignment change
    if (updates.assignedToUserId !== undefined && updates.assignedToUserId !== oldAssignee) {
      await Notification.create({
        userId: updates.assignedToUserId,
        message: `You have been assigned to task "${task.title}"`,
        isRead: false,
        type: 'INFO'
      } as any);
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByPk(Number(taskId));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Sequelize does not automatically cascade self-referencing if not configured fully,
    // but destroying a task could trigger constraints. We should either recursively delete or rely on DB CASCADE.
    // In production, soft-deletes are preferred.
    await task.destroy();
    
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
