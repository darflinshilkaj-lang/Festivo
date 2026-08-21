import { apiCall, ApiResponse } from './api';

export interface BackendNotification {
  id: string;
  _id: string;
  userId: string;
  type:
    | 'new_event'
    | 'registration_success'
    | 'deadline_reminder'
    | 'event_reminder'
    | 'event_updated'
    | 'new_registration'
    | 'event_almost_full';
  title: string;
  message: string;
  read: boolean;
  eventId: string | null;
  registrationId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const notificationService = {
  async getNotifications(): Promise<BackendNotification[]> {
    try {
      const res: ApiResponse = await apiCall('/api/notifications', {
        method: 'GET',
      });
      return res.notifications || [];
    } catch (error) {
      console.warn('Failed to fetch notifications:', error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiCall(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiCall('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
    }
  },
};
