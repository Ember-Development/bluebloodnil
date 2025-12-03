import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const notificationsRouter = Router();

// Notification routes require authentication
notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', getNotifications);
notificationsRouter.get('/unread-count', getUnreadCount);
notificationsRouter.put('/:id/read', markNotificationAsRead);
notificationsRouter.put('/read-all', markAllNotificationsAsRead);

