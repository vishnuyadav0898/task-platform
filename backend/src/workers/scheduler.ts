import { Queue, Worker } from 'bullmq';
import { Op } from 'sequelize';
import { Task, Notification } from '../models';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notification-queue', { connection: connection as any });

// Define the worker
export const notificationWorker = new Worker(
  'notification-queue',
  async (job) => {
    const { taskId, type, message, userId } = job.data;

    // Simulate sending a notification (e.g., email or push)
    console.log(`[Worker] Sending notification to user ${userId}: ${message}`);
    
    // Create notification log in database
    await Notification.create({
      userId,
      message,
      isRead: false,
    });
    
    if (type === 'REMINDER') {
      const task = await Task.findByPk(taskId);
      if (task) {
        await task.update({ reminderSent: true });
      }
    }
  },
  { connection: connection as any }
);

export const schedulerQueue = new Queue('scheduler-queue', { connection: connection as any });

// Background cron job to check for due dates
export const schedulerWorker = new Worker(
  'scheduler-queue',
  async () => {
    console.log('[Scheduler] Checking for upcoming tasks...');
    
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingTasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.between]: [now, next24Hours],
        },
        reminderSent: false,
        status: {
          [Op.notIn]: ['DONE', 'ARCHIVED']
        }
      }
    });

    for (const task of upcomingTasks) {
      if (task.assignedToUserId) {
        await notificationQueue.add(
          'task-reminder',
          {
            taskId: task.id,
            userId: task.assignedToUserId,
            type: 'REMINDER',
            message: `Reminder: Task "${task.title}" is due soon!`,
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
          }
        );
      }
    }
  },
  { connection: connection as any }
);

// Add the repeatable job (runs every 15 minutes)
export const initScheduler = async () => {
  await schedulerQueue.add(
    'check-due-dates',
    {},
    {
      repeat: {
        pattern: '*/15 * * * *',
      },
    }
  );
  console.log('Scheduler initialized with 15-minute cron.');
};
