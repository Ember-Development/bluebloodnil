import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user-specific notifications and broadcast notifications (userId is null)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // Broadcast notifications
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to most recent 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only allow users to mark their own notifications as read
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        OR: [
          { userId },
          { userId: null }, // Allow marking broadcast notifications as read
        ],
      },
      data: {
        read: true,
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // Include broadcast notifications
        ],
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await prisma.notification.count({
      where: {
        OR: [
          { userId },
          { userId: null }, // Include broadcast notifications
        ],
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
}

