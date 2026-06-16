import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Comment, Task, User, Notification } from '../models';

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const task = await Task.findByPk(Number(taskId));
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await Comment.create({
      taskId: task.id,
      userId,
      content,
    });

    const populatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }]
    });

    // Notifications
    const notifications = [];
    if (task.assignedToUserId && task.assignedToUserId !== userId) {
      notifications.push({
        userId: task.assignedToUserId,
        message: `New comment on your assigned task "${task.title}"`,
        isRead: false,
        type: 'INFO'
      });
    }
    if (task.createdById !== userId && task.createdById !== task.assignedToUserId) {
      notifications.push({
        userId: task.createdById,
        message: `New comment on a task you created: "${task.title}"`,
        isRead: false,
        type: 'INFO'
      });
    }

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications as any);
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const comments = await Comment.findAndCountAll({
      where: { taskId },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'ASC']],
      limit: Number(limit),
      offset
    });

    res.json({
      data: comments.rows,
      total: comments.count,
      page: Number(page),
      totalPages: Math.ceil(comments.count / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
