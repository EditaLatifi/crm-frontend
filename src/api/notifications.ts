import { api } from './client';

export interface AppNotification {
  id: string;
  type: 'TASK_ASSIGNED' | 'TASK_COMMENT' | 'DEAL_STAGE_CHANGED' | 'PERMIT_STATUS_CHANGED' | 'VACATION_REVIEWED';
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (): Promise<AppNotification[]> => api.get('/notifications'),
  getUnreadCount: (): Promise<{ count: number }> => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  deleteOne: (id: string) => api.delete(`/notifications/${id}`),
};
