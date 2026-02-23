import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_REFRESH_ENDPOINT = '/auth/refresh';

// ============================================
// Auth State Management (Cookie-based)
// ============================================

// Since backend uses httpOnly cookies, we can't access tokens directly
// We track auth state by attempting to fetch current user
let authState = {
  isAuthenticated: false,
  isChecking: false,
};

export const isAuthenticated = (): boolean => {
  return authState.isAuthenticated;
};

export const setAuthState = (authenticated: boolean): void => {
  authState.isAuthenticated = authenticated;
};

// Clear auth state (logout)
export const clearAuthState = (): void => {
  authState.isAuthenticated = false;
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
  withCredentials: true, // Enable cookies
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
  withCredentials: true, // CRITICAL: Enable cookies for auth
});

// Track if we're currently refreshing
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers of refresh result
const onRefreshComplete = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

// Refresh the access token using httpOnly cookie
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    // Backend will read refresh_token from httpOnly cookie
    await publicClient.post(TOKEN_REFRESH_ENDPOINT, {});
    setAuthState(true);
    onRefreshComplete(true);
    return true;
  } catch (error) {
    clearAuthState();
    onRefreshComplete(false);
    // Redirect to login if refresh fails
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
};

// Request interceptor for private client
privateClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for certain endpoints
    const skipAuthEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
    const shouldSkipAuth = skipAuthEndpoints.some((endpoint) => 
      config.url?.includes(endpoint)
    );

    if (shouldSkipAuth) {
      return config;
    }

    // If currently refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((success: boolean) => {
          if (success) {
            resolve(config);
          } else {
            reject(new Error('Session expired. Please login again.'));
          }
        });
      });
    }

    // Cookies are automatically sent with withCredentials: true
    // No need to manually add Authorization header
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for private client
privateClient.interceptors.response.use(
  (response) => {
    // If request succeeded, mark as authenticated
    setAuthState(true);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If not already refreshing, start refresh
      if (!isRefreshing) {
        isRefreshing = true;
        const success = await refreshAccessToken();
        isRefreshing = false;

        if (success) {
          // Retry original request
          return privateClient(originalRequest);
        } else {
          // Refresh failed, redirect to login
          clearAuthState();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } else {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success: boolean) => {
            if (success) {
              resolve(privateClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    // For other errors, clear auth state if 401/403
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthState();
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
