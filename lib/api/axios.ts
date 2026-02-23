import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_REFRESH_ENDPOINT = '/auth/refresh';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

// Cookie names
const ACCESS_TOKEN_KEY = 'tz_access_token';
const REFRESH_TOKEN_KEY = 'tz_refresh_token';
const TOKEN_EXPIRY_KEY = 'tz_token_expiry';

const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
  sameSite: 'lax' as const,
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const getTokenExpiry = (): number | null => {
  if (typeof window === 'undefined') return null;
  const expiry = Cookies.get(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
};

export const setTokens = (accessToken: string, refreshToken: string, expiresIn: number): void => {
  if (typeof window === 'undefined') return;
  const expiryTime = Date.now() + expiresIn * 1000;
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, COOKIE_OPTIONS);
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, COOKIE_OPTIONS);
  Cookies.set(TOKEN_EXPIRY_KEY, expiryTime.toString(), COOKIE_OPTIONS);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
  Cookies.remove(TOKEN_EXPIRY_KEY, { path: '/' });
};

export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() >= expiry - TOKEN_EXPIRY_BUFFER;
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// ============================================
// Public Axios Instance (no auth required)
// ============================================

const publicClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for public client
publicClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for public client
publicClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Private Axios Instance (with auth & refresh)
// ============================================

const privateClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await publicClient.post(TOKEN_REFRESH_ENDPOINT, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
    setTokens(access_token, new_refresh_token, expires_in);
    onTokenRefreshed(access_token);
    return access_token;
  } catch (error) {
    clearTokens();
    return null;
  }
};

// Request interceptor for private client
privateClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const skipAuthEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
    const shouldSkipAuth = skipAuthEndpoints.some((endpoint) => 
      config.url?.includes(endpoint)
    );

    if (shouldSkipAuth) {
      return config;
    }

    let accessToken = getAccessToken();

    if (isTokenExpired() && !isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        accessToken = newToken;
      } else {
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    } else if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          resolve(config);
        });
      });
    }

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for private client
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return privateClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Export
// ============================================

export { publicClient, privateClient };

// Export types for use in services
export type { AxiosInstance, AxiosError };
