import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../lib/config';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function callRefreshAPI(refreshToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.message ?? `Request failed with status ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

export const tokenManager = {
  async saveTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiryTime = Date.now() + expiresIn * 1000;
    await Promise.all([
      SecureStore.setItemAsync(AUTH_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString()),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
  },

  async isTokenExpired(): Promise<boolean> {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000;
    
    return now >= (expiry - bufferTime);
  },

  async refreshIfNeeded(): Promise<string | null> {
    const isExpired = await this.isTokenExpired();
    
    if (!isExpired) {
      return await this.getAccessToken();
    }

    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = this.performRefresh();

    try {
      const newToken = await refreshPromise;
      return newToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },

  async performRefresh(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('NO_REFRESH_TOKEN');
    }

    try {
      const response = await callRefreshAPI(refreshToken);
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      await this.saveTokens(accessToken, newRefreshToken, expiresIn);
      
      return accessToken;
    } catch (error: any) {
      if (error?.statusCode === 401) {
        await this.clearTokens();
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      throw error;
    }
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
    ]);
  },
};
