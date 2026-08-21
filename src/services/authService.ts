import { apiCall, ApiResponse } from './api';
import { StorageService } from './StorageService';
import { Student } from '../types/Event';

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  department: string;
  year: string;
  college: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface UpdateProfileParams {
  name?: string;
  department?: string;
  year?: string;
  college?: string;
}

export const authService = {
  async registerUser(data: RegisterParams): Promise<{ token: string; user: Student }> {
    const res: ApiResponse = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.token && res.user) {
      await StorageService.saveToken(res.token);
      await StorageService.saveUserProfile(res.user);
      await StorageService.setSessionActive(true);
    }

    return { token: res.token!, user: res.user };
  },

  async loginUser(data: LoginParams): Promise<{ token: string; user: Student }> {
    const res: ApiResponse = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.token && res.user) {
      await StorageService.saveToken(res.token);
      await StorageService.saveUserProfile(res.user);
      await StorageService.setSessionActive(true);
    }

    return { token: res.token!, user: res.user };
  },

  async getProfile(): Promise<Student> {
    const res: ApiResponse = await apiCall('/api/auth/profile', {
      method: 'GET',
    });

    if (res.user) {
      await StorageService.saveUserProfile(res.user);
    }

    return res.user;
  },

  async updateProfile(data: UpdateProfileParams): Promise<Student> {
    const res: ApiResponse = await apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (res.user) {
      await StorageService.saveUserProfile(res.user);
    }

    return res.user;
  },

  async logoutUser(): Promise<void> {
    await StorageService.clearSession();
  },
};
