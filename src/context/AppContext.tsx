import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {Student} from '../types/Event';
import {starterStudent} from '../constants/Strings';
import {StorageService} from '../services/StorageService';
import {authService} from '../services/authService';
import {notificationService, BackendNotification} from '../services/notificationService';

interface NotificationSettings {
  reminders: boolean;
  updates: boolean;
  alerts: boolean;
}

interface AppContextType {
  student: Student;
  updateStudent: (updated: Student) => void;
  fetchProfile: () => Promise<Student | null>;
  logout: () => Promise<void>;
  registeredEventIds: string[];
  updateRegisteredEventIds: (ids: string[]) => void;
  registerForEvent: (eventId: string) => void;
  cancelRegistration: (eventId: string) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  notifications: BackendNotification[];
  notificationsLoading: boolean;
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  /** @deprecated Shim for backward compatibility — backend creates notifications automatically */
  addNotification: (title: string, message: string, type: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [student, setStudent] = useState<Student>(starterStudent);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    reminders: true,
    updates: true,
    alerts: false,
  });
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Load state from Storage on startup
  useEffect(() => {
    const loadSavedData = async () => {
      const savedProfile = await StorageService.getUserProfile();
      if (savedProfile) {
        setStudent(savedProfile);
      }

      const savedEvents = await StorageService.getRegisteredEvents();
      if (savedEvents && savedEvents.length > 0) {
        setRegisteredEventIds(savedEvents);
      }
    };
    loadSavedData();
  }, []);

  // Load notifications from backend on startup
  const refreshNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const fetched = await notificationService.getNotifications();
      setNotifications(fetched);
    } catch (e) {
      console.warn('Failed to refresh notifications:', e);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const updateStudent = (updated: Student) => {
    setStudent(updated);
    StorageService.saveUserProfile(updated);
  };

  const fetchProfile = async (): Promise<Student | null> => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setStudent(profile);
        return profile;
      }
    } catch (e) {
      console.warn('Failed to fetch profile from backend:', e);
    }
    return null;
  };

  const logout = async () => {
    await authService.logoutUser();
    setStudent(starterStudent);
    setNotifications([]);
  };

  const registerForEvent = (eventId: string) => {
    setRegisteredEventIds(prev => {
      if (prev.includes(eventId)) {
        return prev;
      }
      const updated = [...prev, eventId];
      StorageService.saveRegisteredEvents(updated);
      return updated;
    });
  };

  const cancelRegistration = (eventId: string) => {
    setRegisteredEventIds(prev => {
      const updated = prev.filter(id => id !== eventId);
      StorageService.saveRegisteredEvents(updated);
      return updated;
    });
  };

  const updateRegisteredEventIds = (ids: string[]) => {
    setRegisteredEventIds(ids);
    StorageService.saveRegisteredEvents(ids);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  // Backward-compatible shim — previously stored notifications locally;
  // now the backend creates real notifications. We just refresh after any local event.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addNotification = (_title: string, _message: string, _type: string) => {
    // Trigger a background refresh so any server-created notifications surface
    refreshNotifications();
  };

  // Mark a single notification as read (optimistic update + backend sync)
  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? {...n, read: true} : n))
    );
    await notificationService.markAsRead(id);
  };

  // Mark all notifications as read (optimistic update + backend sync)
  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    await notificationService.markAllAsRead();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        student,
        updateStudent,
        fetchProfile,
        logout,
        registeredEventIds,
        updateRegisteredEventIds,
        registerForEvent,
        cancelRegistration,
        notificationSettings,
        updateNotificationSettings,
        notifications,
        notificationsLoading,
        unreadCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
