import AsyncStorage from '@react-native-async-storage/async-storage';
import {Student} from '../types/Event';

const KEYS = {
  AUTH_TOKEN: 'festivo_auth_token',
  USER_PROFILE: 'festivo_user',
  SESSION_ACTIVE: 'festivo_session_active',
  REGISTERED_EVENTS: 'festivo_registered_events',
};

export const StorageService = {
  // Auth Token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('Error saving auth token', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Error getting auth token', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Error removing auth token', e);
    }
  },

  // User Profile
  async saveUserProfile(student: Student): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(student));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },

  async getUserProfile(): Promise<Student | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting user profile', e);
      return null;
    }
  },

  // Session
  async setSessionActive(active: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SESSION_ACTIVE, JSON.stringify(active));
    } catch (e) {
      console.error('Error setting session status', e);
    }
  },

  async isSessionActive(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSION_ACTIVE);
      return data ? JSON.parse(data) : false;
    } catch (e) {
      console.error('Error checking session status', e);
      return false;
    }
  },

  // Registered Events
  async saveRegisteredEvents(eventIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.REGISTERED_EVENTS, JSON.stringify(eventIds));
    } catch (e) {
      console.error('Error saving registered events', e);
    }
  },

  async getRegisteredEvents(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.REGISTERED_EVENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getting registered events', e);
      return [];
    }
  },

  // Clear session & token
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(KEYS.USER_PROFILE);
      await AsyncStorage.removeItem(KEYS.SESSION_ACTIVE);
    } catch (e) {
      console.error('Error clearing session', e);
    }
  },
};
