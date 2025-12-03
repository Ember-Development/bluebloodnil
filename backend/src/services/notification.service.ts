import { prisma } from '../config/prisma';

export async function createNotification(data: {
  userId?: string | null; // null = broadcast to all users
  type: 'CAMPAIGN_ASSIGNED' | 'CAMPAIGN_CREATED' | 'BRAND_ADDED' | 'TODO_ASSIGNED' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  linkUrl?: string;
  campaignId?: string;
  todoId?: string;
}) {
  return await prisma.notification.create({
    data: {
      userId: data.userId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      linkUrl: data.linkUrl || null,
      campaignId: data.campaignId || null,
      todoId: data.todoId || null,
    },
  });
}

export async function createNotificationsForUsers(userIds: string[], data: {
  type: 'CAMPAIGN_ASSIGNED' | 'CAMPAIGN_CREATED' | 'BRAND_ADDED' | 'TODO_ASSIGNED' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  linkUrl?: string;
  campaignId?: string;
  todoId?: string;
}) {
  return await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      linkUrl: data.linkUrl || null,
      campaignId: data.campaignId || null,
      todoId: data.todoId || null,
    })),
  });
}

