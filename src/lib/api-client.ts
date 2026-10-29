import { API_BASE_URL } from './config';
import { tokenManager } from '../services/auth/tokenManager';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  token?: string
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  let authToken = token;
  if (token) {
    try {
      authToken = await tokenManager.refreshIfNeeded() || token;
    } catch (error: any) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'NO_REFRESH_TOKEN') {
        if (logoutCallback) logoutCallback();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : `Request failed: ${response.statusText}`,
        response.status
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (logoutCallback) logoutCallback();
      }
      
      throw new ApiError(
        data.message ?? data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let authToken = token;
  if (token) {
    try {
      authToken = await tokenManager.refreshIfNeeded() || token;
    } catch (error: any) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'NO_REFRESH_TOKEN') {
        if (logoutCallback) logoutCallback();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : `Request failed: ${response.statusText}`,
        response.status
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (logoutCallback) logoutCallback();
      }
      
      throw new ApiError(
        data.message ?? data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let authToken = token;
  if (token) {
    try {
      authToken = await tokenManager.refreshIfNeeded() || token;
    } catch (error: any) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'NO_REFRESH_TOKEN') {
        if (logoutCallback) logoutCallback();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : `Request failed: ${response.statusText}`,
        response.status
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (logoutCallback) logoutCallback();
      }
      
      throw new ApiError(
        data.message ?? data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

export async function apiPut<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let authToken = token;
  if (token) {
    try {
      authToken = await tokenManager.refreshIfNeeded() || token;
    } catch (error: any) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'NO_REFRESH_TOKEN') {
        if (logoutCallback) logoutCallback();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : `Request failed: ${response.statusText}`,
        response.status
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (logoutCallback) logoutCallback();
      }
      
      throw new ApiError(
        data.message ?? data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let authToken = token;
  if (token) {
    try {
      authToken = await tokenManager.refreshIfNeeded() || token;
    } catch (error: any) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'NO_REFRESH_TOKEN') {
        if (logoutCallback) logoutCallback();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new ApiError(
        response.ok ? 'Invalid server response' : `Request failed: ${response.statusText}`,
        response.status
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (logoutCallback) logoutCallback();
      }
      
      throw new ApiError(
        data.message ?? data.error ?? `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}
