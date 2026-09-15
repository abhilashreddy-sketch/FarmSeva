import { API_BASE_URL } from '../config/api';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('farm_seva_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('farm_seva_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('farm_seva_token');
  }
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || json.message || `Request failed (${response.status})`,
      };
    }

    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error occurred. Please check API server connection.',
    };
  }
}
