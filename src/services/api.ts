import { StorageService } from './StorageService';

// Central API Base URL Configuration
// Uses the computer's local IPv4 address (10.106.27.199:5000) so physical Android devices can connect over local Wi-Fi
export const API_BASE_URL = 'http://172.27.123.199:5000';

interface ApiOptions extends RequestInit {
  token?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  token?: string;
  user?: T;
  [key: string]: any;
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> => {
  const { token, headers: customHeaders, ...customOptions } = options;

  let authToken = token;
  if (authToken === undefined) {
    authToken = await StorageService.getToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        message: 'Invalid response format from server.',
      };
    }

    if (!response.ok) {
      const errorMessage =
        data.message ||
        (response.status === 401
          ? 'Invalid email or password'
          : response.status === 403
          ? 'Access denied.'
          : response.status === 409
          ? 'Email is already registered.'
          : response.status === 404
          ? 'User or resource not found.'
          : 'Server error. Please try again later.');

      const err: any = new Error(errorMessage);
      if (data.code) err.code = data.code;
      if (data.checkedInAt) err.checkedInAt = data.checkedInAt;
      throw err;
    }

    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('Network')) {
      throw new Error('Unable to connect to Festivo server. Please check your network connection.');
    }
    throw error;
  }
};
