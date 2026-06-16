import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Notification } from '../models';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user!.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user!.id, isRead: false } }
    );
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.destroy({ where: { userId: req.user!.id } });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
